import h5py
import numpy as np

def load_nwb_item(file, *, nwb_path, verbose=False):
    opts = dict(
        verbose=verbose
    )
    opts['file'] = file
    return _load_nwb_item(file, opts=opts, nwb_path=nwb_path)

def _load_nwb_item(f, *, opts, nwb_path):
    if opts.get('verbose', None):
        print('_load_nwb_item', nwb_path)
    list0 = [a for a in nwb_path.split('/') if a]
    if len(list0) == 0:
        raise Exception('Problem in _load_nwb_item: path is too short')
    name0 = list0[0]
    if name0 not in f.keys():
        raise Exception('Problem in _load_nwb_item: Missing key {}'.format(name0))
    item = f[name0]
    if len(list0) == 1:
        return item
    else:
        if not isinstance(item, h5py.Group):
            raise Exception('Problem in _load_nwb_item: Not a group {}'.format(name0))
        return _load_nwb_item(item, opts=opts, nwb_path='/' + '/'.join(list0[1:]))