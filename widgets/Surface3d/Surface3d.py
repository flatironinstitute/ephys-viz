from reactopya import Component
from mountaintools import client as mt
import base64
from vtk.util.numpy_support import vtk_to_numpy
from vtk import vtkXMLPolyDataReader


class Surface3d(Component):
    def __init__(self):
        super().__init__()

    def javascript_state_changed(self, prev_state, state):
        self.set_python_state(dict(status='running', status_message='Running'))

        self.set_python_state(dict(status='finished'))