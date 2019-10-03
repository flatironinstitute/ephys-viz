# ephys-viz

Neurophysiology visualization components deployable to the notebook, web, or desktop.

This project is at an early stage of development.

A live preview of these widgets can be found [here](http://50.116.50.203:8080/).

## Installation

See [installation instructions](generated/docs/install.md).

## Usage

See the [notebook_examples](notebook_examples) and [desktop_examples](desktop_examples) directories for usage examples.

It is possible to view the widgets in JupyterLab, Jupyter Notebook, Google Colaboratory, or on a hosted webpage. See the installation instructions for more information on enabling these methods.

## Hosting gallery of example widgets

You can host the gallery of example widgets in a docker container using the following procedure:

```
# build the container
docker build -t ephys_viz_gallery -f docker/gallery/Dockerfile .

# run the container on PORT 8085 (or choose a different port)
# Note: make sure that the SHA1_CACHE_DIR env variable point to your mountaintools sha1 cache directory (by default it is /tmp/sha1-cache)
docker run -p 8085:6065 -v $SHA1_CACHE_DIR:/tmp/sha1-cache -it ephys_viz_gallery
```

## Tests

Some docker tests are available in the [generated/tests](generated/tests) directory.

