# ephys-viz

Neurophysiology visualization components deployable to the notebook, web, or desktop.

This project is at an early stage of development.

A live preview of these widgets can be found [here](http://50.116.50.203:8080/).

## Installation

Prerequisites:

* Linux or OS X
* Python >= 3.6

**JupyterLab**

Use JupyterLab >= 1.0.9

First install the reactopya_jup python package and JupyterLab extension, if not already installed:

```
jupyter labextension install @jupyter-widgets/jupyterlab-manager
jupyter labextension install reactopya_jup
pip install --upgrade reactopya_jup
```

Then install ephys_viz_jup:

```
pip install --upgrade ephys_viz_jup
```

**Jupyter notebook**

(Note working quite yet)

**Google Colaboratory**

Not working quite yet, but in the future:

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

**JupyterLab (development installation)**

First install the reactopya_jup Python package and JupyterLab extension as above

Then:

```
reactopya install-jupyter
```

**Jupyter notebook (development installation)**

[Not quite ready]

**Google colab (development installation)**

Not quite ready, but in the future:

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
