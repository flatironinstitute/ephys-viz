## ephys_viz installation

## Prerequisites

* Linux or OS X
* Python >= 3.6

## JupyterLab and Jupyter Notebook

To use ephys_viz within JupyterLab and in Jupyter Notebook you will first need to install the reactopya_jup notebook extension.

As a prerequisite (for JupyterLab) you need the ipywidgets lab extension:

```
jupyter labextension install @jupyter-widgets/jupyterlab-manager
```

Next, install the the latest reactopya_jup Python package:

```
pip install --upgrade reactopya_jup==0.5.0
```

For JupyterLab, install the lab extension:

```
jupyter labextension install reactopya_jup@0.5.0
```

For Jupyter Notebook, install and enable the notebook extension:

```
jupyter nbextension install --sys-prefix --py reactopya_jup
jupyter nbextension enable reactopya_jup --py --sys-prefix
```

Finally, install the Jupyter Python package for ephys_viz:

```
pip install ephys_viz_jup==0.4.0
```

## Development installation

A development installation has the following additional prerequisites

* NodeJS >= 8
* Yarn
* reactopya

First install [reactopya](https://github.com/flatironinstitute/reactopya):

```
pip install --upgrade reactopya
```

Now clone this repo:

```
git clone [this_repo]
cd [directory-of-the-repo]
```

**Electron development mode**

This following is the best way to develop the widgets

```
# you only need to run this once:
reactopya install-electron

# The following will open the gallery of widgets in development mode
# with hot module reloading whenever the source code changes
reactopya start-gallery-dev
```

**JupyterLab and Jupyter Notebook (development installation)**

First install the reactopya_jup Python package and JupyterLab and Jupyter Notebooks extensions as above

Then:

```
reactopya install-jupyter
```

Now you should be able to `import ephys_viz_jup` as in the example notebook

## Google colab

Google colab usage is same as JupyterLab and Jupyter Notebooks except replace `init_jupyter()` by `init_colab()`.

While it is possible to use a local runtime for colab, this involves a bit of a hack to get the callbacks to work properly. Ask me about it if you are interested.

## Web server

To open the gallery of ephys_viz widgets as a web server, follow the instructions for a development installation above, and then:

```
reactopya install-server
reactopya start-server
```
