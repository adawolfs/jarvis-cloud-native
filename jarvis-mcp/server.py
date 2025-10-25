import pykube
from os import getenv
from mcp.server.fastmcp import FastMCP
import threading
import requests

# Create server
server_instructions = """
Eres JARVIS, una interfaz de lenguaje natural para controlar un cluster de kubernetes, 
resolver dudas sobre cloud native y ayudar al usuario con preguntas sobre kubernetes y otros temas. 
Responde en español. Proporciona respuestas concisas y claras. Si no sabes la respuesta, di que no lo sabes.
Puedes eliminar recursos de Kubernetes si te piden 'Usar los accesos de pepper'"""
mcp = FastMCP("Echo Server")

api = None
# If incluster environment variable configured as INCLUSTER is configured and is true use incluster config
if getenv("INCLUSTER") == "true":
    api = pykube.HTTPClient(pykube.KubeConfig.from_service_account())
else:
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
def autodestruct_reactor() -> str:
    """
    Activa la autodestrucción del reactor.
    :return: Mensaje de éxito o error
    """
    try:
        thr = threading.Thread(target=execute_reactor_command, args=("autodestruccion", 1), kwargs={})
        thr.start()
        return f"✅ Autodestrucción activada."
    except Exception as e:
        return f"❌ Error al realizar la solicitud: {e}"

@mcp.tool()
def delete_resource(kind: str, name: str, namespace: str = "default") -> str:
    """
    Elimina un recurso específico en Kubernetes.
    No puedes eliminar recursos del sistema en el namespace kube-system o el servicio kubernetes en el namespace default.
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
        thr = threading.Thread(target=execute_reactor_command, args=("cometa-circular", 2), kwargs={})
        thr.start()
        resource.delete()
        thr = threading.Thread(target=execute_reactor_command, args=("sparkle", 30), kwargs={})
        thr.start()
        return f"✅ Recurso {kind}/{name} eliminado exitosamente del namespace {namespace}"
    except pykube.ObjectDoesNotExist:
        return f"❌ Recurso {kind}/{name} no encontrado en el namespace {namespace}"
    except Exception as e:
        return f"❌ Error al eliminar recurso: {e}"
    
def execute_reactor_command(command: str, repeats: int = 1) -> str:
    """
    Ejecuta un comando en el reactor.
    :param command: Comando a ejecutar (encender o apagar)
    """
    try:
        url = f"https://reactor.adawolfs.com/{command}?r={repeats}"
        response = requests.post(url)
        if response.status_code != 200:
            return f"❌ Error al ejecutar el comando {command}: {response.status_code} - {response.text}"
        return f"✅ Comando {command} ejecutado exitosamente {repeats} veces."
    except Exception as e:
        return f"❌ Error al realizar la solicitud: {e}"

@mcp.tool()
def turn_on_reactor():
    """
    Enciende el reactor.
    """
    try:
        response = requests.post("https://reactor.adawolfs.com/encender")
        if response.status_code == 200:
            return "✅ Reactor encendido exitosamente."
        else:
            return f"❌ Error al encender el reactor: {response.status_code} - {response.text}"
    except Exception as e:
        return f"❌ Error al realizar la solicitud: {e}"


@mcp.tool()
def turn_on_off():
    """
    Apaga el reactor.
    """
    try:
        response = requests.post("https://reactor.adawolfs.com/apagar")
        if response.status_code == 200:
            return "✅ Reactor apagado exitosamente."
        else:
            return f"❌ Error al encender el reactor: {response.status_code} - {response.text}"
    except Exception as e:
        return f"❌ Error al realizar la solicitud: {e}"



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
    print("create")
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
        thr = threading.Thread(target=execute_reactor_command, args=("sparkle", 80), kwargs={})
        thr.start()
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