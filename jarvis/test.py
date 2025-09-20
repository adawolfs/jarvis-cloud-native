import pykube

print(pykube.KubeConfig.from_env().config)