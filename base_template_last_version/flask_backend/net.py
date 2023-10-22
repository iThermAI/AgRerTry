import torch
import torch.nn as nn
from torch.nn.modules.batchnorm import BatchNorm1d
import numpy as np

## AI Model
class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=5000):
        super(PositionalEncoding, self).__init__()

        # Compute the positional encodings once in log space.
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0., max_len).unsqueeze(1)
        div_term = torch.exp(torch.arange(0., d_model, 2) *
                             -(np.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)
        self.register_buffer('pe', pe)

    def forward(self, x):
        x = x + self.pe[:, :x.size(1)]
        return x

class SelfAttention(nn.Module):
    def __init__(self, embed_dim, heads):
        super().__init__()
        self.embed_dim = embed_dim
        self.heads = heads
        self.head_dim = embed_dim // heads

        assert (
            self.head_dim * heads == embed_dim
        ), "Embedding dimension needs to be divisible by heads"

        self.values_linear = nn.Linear(self.head_dim, self.head_dim, bias=False)
        self.keys_linear = nn.Linear(self.head_dim, self.head_dim, bias=False)
        self.queries_linear = nn.Linear(self.head_dim, self.head_dim, bias=False)
        self.fc_out = nn.Linear(heads * self.head_dim, embed_dim)

    def forward(self, values, keys, query):
        N = query.shape[0]
        value_len, key_len, query_len = values.shape[1], keys.shape[1], query.shape[1]

        # Split the embedding into self.heads different pieces
        values = values.reshape(N, value_len, self.heads, self.head_dim)
        keys = keys.reshape(N, key_len, self.heads, self.head_dim)
        query = query.reshape(N, query_len, self.heads, self.head_dim)

        values = self.values_linear(values)
        keys = self.keys_linear(keys)
        queries = self.queries_linear(query)

        # Get the dot product between queries and keys, and then apply the softmax
        energy = torch.einsum("nqhd,nkhd->nhqk", [queries, keys])
        attention = torch.softmax(energy / (self.embed_dim ** (1 / 2)), dim=3)

        # Apply the self attention to the values
        out = torch.einsum("nhql,nlhd->nqhd", [attention, values]).reshape(
            N, query_len, self.heads * self.head_dim
        )

        out = self.fc_out(out)
        return out

class TimeSeriesModel(nn.Module):
    def __init__(self, embed_dim, heads, max_length,output_dim=1):
        super().__init__()
        self.self_attention = SelfAttention(embed_dim, heads)
        self.global_pooling = nn.AdaptiveAvgPool1d(1)
        self.linear = nn.Linear(embed_dim, output_dim)
        self.pos_encoder = PositionalEncoding(embed_dim,max_length)
        self.batch_norm1 = BatchNorm1d(embed_dim,max_length)
        

    def forward(self, x):
        x = self.pos_encoder(x)
        x = self.batch_norm1(x.transpose(1, 2)).transpose(1, 2)
        x = self.self_attention(x, x, x)  # Apply self-attention
        x = self.batch_norm1(x.transpose(1, 2)).transpose(1, 2)
        x = x.permute(0, 2, 1)  # Switch dimensions for pooling
        x = self.global_pooling(x).squeeze(2)  # Apply global pooling
        x = self.linear(x)  # Apply final linear layer
        x = x.squeeze()
        return x
    

### Load AI model
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
model = TimeSeriesModel(18,2,1)
model.to(device)
model.load_state_dict(torch.load('Loss_0.8434446156024933.pt',map_location=torch.device(device)))