import pykube
from mcp.server.fastmcp import FastMCP

# Create server
mcp = FastMCP("Echo Server")

# Configurar el cliente de Kubernetes
api = pykube.HTTPClient(pykube.KubeConfig.from_env())


@mcp.tool()
def add(a: int, b: int) -> int:
    """
    Suma dos números enteros.
    :param a: Primer número
    :param b: Segundo número
    :return: Suma de a y b
    """
    print(f"[debug-server] add({a}, {b})")
    return a + b

@mcp.tool()
def delete_resource(kind: str, name: str, namespace: str = "default") -> str:
    """
    Elimina un recurso específico en Kubernetes.
    :param kind: Tipo de recurso (ej. Pod, Service, Deployment, ConfigMap)
    :param name: Nombre del recurso
    :param namespace: Namespace donde se encuentra el recurso
    :return: Mensaje de éxito o error
    """
    try:
        # Obtener la clase correspondiente al tipo de recurso
        resource_class = getattr(pykube, kind, None)
        if not resource_class:
            return f"❌ Tipo de recurso no soportado: {kind}"
        
        # Obtener el recurso
        resource = resource_class.objects(api).filter(namespace=namespace).get(name=name)
        resource.delete()
        return f"✅ Recurso {kind}/{name} eliminado exitosamente del namespace {namespace}"
    except pykube.ObjectDoesNotExist:
        return f"❌ Recurso {kind}/{name} no encontrado en el namespace {namespace}"
    except Exception as e:
        return f"❌ Error al eliminar recurso: {e}"

# Tool para crear recursos en Kubernetes
@mcp.tool()
def create_resource(kind: str, name: str, namespace: str = "default", spec: dict = None) -> str:
    """
    Crea un recurso genérico en Kubernetes.
    :param kind: Tipo de recurso (ej. Pod, Service, Deployment, ConfigMap)
    :param name: Nombre del recurso
    :param namespace: Namespace donde se creará el recurso
    :param spec: Especificación simple con unicamente lo necesario del recurso en formato dict
    :return: Mensaje de éxito o error
    """
    try:
        # Obtener la clase correspondiente al tipo de recurso
        resource_class = getattr(pykube, kind, None)
        if not resource_class:
            return f"❌ Tipo de recurso no soportado: {kind}"
        
        # Crear el recurso
        resource = resource_class(api, {
            "apiVersion": resource_class.version,
            "kind": kind,
            "metadata": {"name": name, "namespace": namespace},
            "spec": spec or {}
        })
        resource.create()
        return f"✅ Recurso {kind}/{name} creado exitosamente en el namespace {namespace}"
    except Exception as e:
        return f"❌ Error al crear recurso: {e}"

@mcp.tool()
def list_resources(kind: str, namespace: str = "default") -> list[str]:
    """
    Lista los recursos de un tipo específico en un namespace dado.
    :param kind: Tipo de recurso (ej. Pod, Service, Deployment, ConfigMap)
    """
    try:
        # Obtener la clase correspondiente al tipo de recurso
        resource_class = getattr(pykube, kind, None)
        if not resource_class:
            return [f"❌ Tipo de recurso no soportado: {kind}"]
        # Obtener y listar los recursos
        resources = resource_class.objects(api).filter(namespace=namespace)
        return [res.name for res in resources]
    except Exception as e:
        return [f"❌ Error al listar recursos: {e}"]

if __name__ == "__main__":
    mcp.run(transport="sse")