# ephys-viz

Neurophysiology visualization components deployable to the notebook, web, or desktop.

A live preview of these widgets can be found [here](http://50.116.50.203:8080/).

## Installation

Prerequisites:

* Linux or OS X
* Python >= 3.6
* NodeJS >= 8
* Yarn

This project uses [reactopya](https://github.com/flatironinstitute/reactopya) and involves code generation. First install reactopya:

```
pip install --upgrade git+https://github.com/flatironinstitute/reactopya
```

### Jupyter notebook extension

To install the jupyter notebook extension (after upgrading reactopya as above):

```
cd [directory-of-this-repo]
reactopya install-jupyter-extension
```

Now you should be able to `import ephys_viz_jup` from a jupyter notebook. See the example in the `example_notebooks/` directory.

### Electron development mode

To open a desktop (electron) window showing a gallery view of all the widgets in this project, with hot module reload (convenient for widget development):

```
cd [directory-of-this-repo]
reactopya install-electron
```

Then to start the development server and open the window:

```
reactopya start-electron-dev
```

If you modify any of the source code inside `widgets/`, you can then update the generated code via the following command:

```
reactopya generate
```

Or to continuously watch and regenerate on change:

```
reactopya watch
```

### Stand-alone server

To use the standalone server (as in the live preview):

```
reactopya install-server
reactopya start-server
```
