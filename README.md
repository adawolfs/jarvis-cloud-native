# Install a Cluster

This was done by using Docker Desktop and Kubernetes.

# Configure Kong

https://docs.konghq.com/gateway/latest/install/kubernetes/proxy/

# Control Plane

```bash
NAME: kong-cp
LAST DEPLOYED: Wed Feb 19 21:32:15 2025
NAMESPACE: kong
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
To connect to Kong, please execute the following commands:

HOST=$(kubectl get svc --namespace kong kong-cp-kong-proxy -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
PORT=$(kubectl get svc --namespace kong kong-cp-kong-proxy -o jsonpath='{.spec.ports[0].port}')
export PROXY_IP=${HOST}:${PORT}
curl $PROXY_IP

Once installed, please follow along the getting started guide to start using
Kong: https://docs.konghq.com/kubernetes-ingress-controller/latest/guides/getting-started/
```

# Data Plane

```bash
helm install kong-dp kong/kong -n kong --values ./values-dp.yaml
NAME: kong-dp
LAST DEPLOYED: Wed Feb 19 21:37:01 2025
NAMESPACE: kong
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
To connect to Kong, please execute the following commands:

HOST=$(kubectl get svc --namespace kong kong-dp-kong-proxy -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
PORT=$(kubectl get svc --namespace kong kong-dp-kong-proxy -o jsonpath='{.spec.ports[0].port}')
export PROXY_IP=${HOST}:${PORT}
curl $PROXY_IP
                                                                                                                        Once installed, please follow along the getting started guide to start using
Kong: https://docs.konghq.com/kubernetes-ingress-controller/latest/guides/getting-started/
```