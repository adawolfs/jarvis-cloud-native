# Kube MCP J.A.R.V.I.S.

## Overview
Kube MCP J.A.R.V.I.S. is a cloud-native Python project that provides an API server for managing Kubernetes workloads using the Model Context Protocol (MCP). It also includes a Pykube controller for advanced resource management.

## Features
- MCP-compliant API server (Python)
- Pykube controller for Kubernetes resource automation
- Containerfile for easy containerization
- Kubernetes manifests for deployment, including RBAC configuration

## Directory Structure
```
jarvis-mcp/
├── server.py
├── Containerfile
├── manifest.yaml
└── README.md
```

## Building the Container Image
```sh
docker build --platform linux/amd64 -t ghcr.io/adawolfs/jarvis-mcp:latest -f Containerfile .
```

## Running Locally
```sh
docker run -p 8080:8080 ghcr.io/adawolfs/jarvis-mcp:latest 
```

## Kubernetes Installation

1. **Apply manifests (includes RBAC):**
    ```sh
    kubectl apply -f manifest.yaml
    ```

2. **Verify deployment:**
    ```sh
    kubectl get all -n jarvis-mcp
    ```

## Usage
Interact with the MCP API and Pykube controller via HTTP requests to the exposed service endpoint.

> **Note:** This project is intended for use by an OpenAI Agent for automation and integration tasks.
