from vtk import vtkXMLPolyDataReader
from ..pycommon.nwb_to_dict import nwb_to_dict
from mountaintools import client as mt
import numpy as np
from .examples import examples


class CorticalSurface:
    examples = examples

    def __init__(self):
        super().__init__()

    def javascript_state_changed(self, prev_state, state):
        self.set_python_state(dict(status='running', status_message='Running'))

        # get javascript state
        download_from = state.get('download_from', [])
        path = state.get('path', None)
        name = state.get('name', None)

        if path and name:
            mt.configDownloadFrom(download_from)
            if path.endswith('.nwb'):
                self.set_python_state(dict(status_message='Realizing object from nwb file: {}'.format(path)))
                obj = nwb_to_dict(path, use_cache=True)
            else:
                self.set_python_state(dict(status_message='Realizing object: {}'.format(path)))
                obj = mt.loadObject(path=path)
            if not obj:
                self.set_python_state(dict(
                    status='error',
                    status_message='Unable to realize object: {}'.format(path)
                ))
                return
            datasets = obj['general']['subject']['cortical_surfaces'][name]['_datasets']
            faces0 = np.load(mt.realizeFile(datasets['faces']['_data']))
            vertices = np.load(mt.realizeFile(datasets['vertices']['_data'])).T

            # there's a better way to do the following
            # (need to get it into a single vector format)
            faces = []
            for j in range(faces0.shape[0]):
                # 3 = #vertices in polygon (assume a triangulation)
                faces.extend([3, faces0[j, 0], faces0[j, 1], faces0[j, 2]])
            faces = np.array(faces)

            # return this python state to the javascript
            self.set_python_state(dict(
                faces=faces,
                vertices=vertices,
                status='finished',
                status_message='Done.'
            ))
        else:
            self.set_python_state(dict(
                status='error',
                status_message='Missing path and/or name'
            ))
