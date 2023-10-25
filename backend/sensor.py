import socket


def connect_to_sensor(sensor_ip, sensor_port):
    # Create a TCP socket
    tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        # Receive data from the server
        tcp_socket.connect((sensor_ip, sensor_port))
        print("Connected to the server.")
        while True:
            data = tcp_socket.recv(1024)
            print("Received data:", data.decode())

    except ConnectionRefusedError:
        print(
            "Connection refused. Make sure the sensor is running and the correct IP and port are provided."
        )

    except Exception as e:
        print("An error occurred:", str(e))

    finally:
        # Close the socket
        tcp_socket.close()
        # print("Socket closed.")


# Example usage
sensor_ip = "localhost"  # Replace with the server's IP address
sensor_port = 25555  # Replace with the server's port
connect_to_sensor(sensor_ip, sensor_port)
