# Jarvis Reactor

Jarvis Reactor is an Arduino-based project designed for the ESP32 microcontroller. It runs a web server to control and monitor a reactor system, providing a user-friendly interface for remote management.

## Features

- **ESP32 Web Server:** Host a web interface for real-time reactor control.
- **Remote Monitoring:** View reactor status and logs from any device on the network.
- **Control Functions:** Start, stop, and configure reactor parameters via the web UI.
- **Arduino IDE Compatible:** Easily upload and modify code using the Arduino IDE.

## Getting Started

### Hardware Requirements

- ESP32 Development Board
- Reactor hardware (custom or compatible)
- Wi-Fi network

### Software Requirements

- Arduino IDE (latest version)
- `jarvis.ino` file (main firmware)

### Installation

1. Clone this repository:
    ```bash
    git clone https://github.com/adawolfs/jarvis-cloud/native.git
    ```
2. Open `reactor/reactor.ino` in Arduino IDE.
3. Select your ESP32 board and configure Wi-Fi credentials.
4. Upload the sketch to your ESP32.

### Usage

- Connect ESP32 to your reactor hardware.
- Power on the ESP32.
- Access the web server via the ESP32's IP address in your browser.
- Use the web interface to control and monitor the reactor.

## File Structure

```
├── reactor.ino      # Main Arduino sketch
├── README.md       # Project documentation
```

## License

This project is licensed under the MIT License.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

**Built with Arduino IDE & ESP32 for smart reactor control.**