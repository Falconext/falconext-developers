# Publicar `falconext-logistica` en PyPI

> Ejecuta estos comandos en TU terminal (necesitan tu cuenta PyPI).

## Prerrequisitos (una sola vez)
1. Crea cuenta en https://pypi.org, verifica el email y **activa 2FA**.
2. Crea un **API token**: Account settings → API tokens → *Add API token*
   (scope: "Entire account" la primera vez). Copia el token `pypi-…` (solo se muestra una vez).
3. Instala las herramientas:
   ```bash
   pip install build twine
   ```

## Publicar
```bash
cd sdk/python
python -m build                 # genera dist/*.whl y dist/*.tar.gz  (YA generados)
python -m twine check dist/*    # valida (debe decir PASSED)
python -m twine upload dist/*   # sube a PyPI
#   Username: __token__
#   Password: pypi-…  (tu token)
```

> Recomendado la primera vez: prueba en TestPyPI antes:
> ```bash
> python -m twine upload --repository testpypi dist/*
> pip install -i https://test.pypi.org/simple/ falconext-logistica
> ```

Verifica:
```bash
pip install falconext-logistica
python -c "from falconext_logistica import FalconextLogistica; print('ok')"
```

## Nueva versión (más adelante)
1. Sube `version` en `pyproject.toml` (y `__version__` en `__init__.py`).
2. `rm -rf dist && python -m build && python -m twine upload dist/*`.
> Las versiones son inmutables: no puedes re-subir la misma.
