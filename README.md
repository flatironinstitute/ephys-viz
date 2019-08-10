# ephys-viz

Neurophysiology visualization components deployable to the notebook, web, or desktop

## Installation

This project uses [reactopya](https://github.com/flatironinstitute/reactopya) and involves code generation. First install reactopya:

```
pip install --upgrade git+https://github.com/flatironinstitute/reactopya
```

### Jupyter notebook extension

To install the jupyter notebook extension

```
cd [directory-of-this-repo]
reactopya install-jupyter-extension
```

Now you should be able to `import ephys_viz_jup` from a jupyter notebook. See the example in the `example_notebooks/` directory.

### Electron development mode

To open a desktop (electron) window showing a gallery view of all the widgets in this project, with hot module reload:

```
cd [directory-of-this-repo]
reactopya install-electron
```

Then to start the development server and open the window:

```
reactopya start-electron-dev
```

If you modify any of the source code inside `widgets/`, you can then update the generated code via:

```
reactopya generate
```