# ephys-viz

Neurophysiology visualization components deployable to the notebook, web, or desktop.

A live preview of these widgets can be found [here](http://50.116.50.203:8080/).

## Installation

Prerequisites:

* Linux or OS X
* Python >= 3.6

**JupyterLab**

Use JupyterLab >= 1.0.9

```
pip install --upgrade ephys_viz_jup
jupyter labextension install ephyz_viz_jup
```

And if you haven't already installed the ipywidgets lab extension, you should also install:

```
jupyter labextension install @jupyter-widgets/jupyterlab-manager
```

**Jupyter notebook**

```
pip install --upgrade ephys_viz_jup
```

(Note: I think this doesn't quite work yet -- working on it)

**Google Colaboratory**

At the top of the colab notebook:

```
!pip install ephys_viz_colab=={explicit_version}
```

Note that it is a good idea to give the explicit version so that the notebooks continue to work into the future.

**On the desktop (electron)**

[Instructions coming soon]

**In the browser**

[Instructions coming soon]

## Development installation

A development installation has the following additional prerequisites

* NodeJS >= 8
* Yarn
* reactopya

First install [reactopya](https://github.com/flatironinstitute/reactopya):

```
pip install reactopya
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

**JupyterLab (development installation)**

```
reactopya install-jupyter-labextension
```

**Jupyter notebook (development installation)**

```
reactopya install-jupyter-extension
```

**Google colab (development installation)**

```
reactopya build-colab
```

Then you can tell google colab to connect to a local runtime. However, there is one more trick you need to play to get it to work, and I will tell you about it if you ask.

**Web server**

To open the gallery as a web server

```
reactopya install-server
reactopya start-server
```
