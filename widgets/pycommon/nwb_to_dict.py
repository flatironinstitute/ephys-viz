import h5py
import numpy as np
from mountaintools import client as mt
from spikeforest import mdaio
import tempfile
import shutil
import mlprocessors as mlpr
import simplejson

def nwb_to_dict(fname, *, upload_to=None, use_cache=False, exclude_data=False, verbose=False):
    if fname.endswith('.json'):
        with open(fname, 'r') as f:
            return simplejson.load(f)
    if use_cache:
        result = NWBToDict.execute(
            h5_in=fname,
            upload_to=upload_to or '',
            json_out={'ext': '.json'}
        )
        if result.retcode != 0:
            raise Exception('Problem running NWBToDict.')
        return mt.loadObject(path=result.outputs['json_out'])

    fname = mt.realizeFile(path=fname)
    opts = dict(
        upload_to=upload_to,
        exclude_data=exclude_data,
        verbose=verbose
    )
    with h5py.File(fname, 'r') as f:
        opts['file'] = f
        return _nwb_to_dict(f, opts=opts, name=None, path='')



def getBaseName(path):
    return path.split('/')[-1]


class TemporaryDirectory():
    def __init__(self):
        pass

    def __enter__(self):
        self._path = str(tempfile.mkdtemp())
        return self._path

    def __exit__(self, exc_type, exc_val, exc_tb):
        shutil.rmtree(self._path)

    def path(self):
        return self._path


def npy_dtype_to_string(dt):
    str = dt.str[1:]
    map = {
        "f2": 'float16',
        "f4": 'float32',
        "f8": 'float64',
        "u1": 'uint8',
        "i1": 'uint8',
        "i2": 'int16',
        "i4": 'int32',
        "i8": 'int32',  # note that mda does not support int64 (I believe)
        "u2": 'uint16',
        "u4": 'uint32',
        "u8": 'uint32'
    }
    return map[str]


def _handle_val(val, *, opts, name):
    if type(val) == str:
        return val
    elif type(val) == int:
        return val
    elif type(val) == float:
        return val
    elif isinstance(val, np.floating):
        return float(val)
    elif isinstance(val, np.integer):
        return int(val)
    elif type(val) == bytes:
        return val.decode('utf-8')
    elif type(val) == np.ndarray:
        if name in ['data', 'timestamps', 'spike_times', 'image_mask', 'faces', 'vertices']:
            print('Using snapshot for', name, val.shape)
            snapshot = True
        else:
            snapshot = False
        return _handle_ndarray(val, opts=opts, name=name, snapshot=snapshot)
    elif type(val) == h5py.Reference:
        name0 = h5py.h5r.get_name(val, opts['file'].id).decode('utf-8')
        return 'ref:{}'.format(name0)
        # print('Unable to handle reference type')
        # return 'REF:{}'.format(refname)
    elif type(val) == bool:
        return val
    else:
        print('WARNING: Unhandled type: {}'.format(type(val)))
        return 'unhandled_val'


def _handle_list_or_val(val, *, opts, name):
    if type(val) == list:
        return [_handle_list_or_val(x, opts=opts, name='{}.{}'.format(name, ind)) for ind, x in enumerate(val)]
    else:
        return _handle_val(val, opts=opts, name=name)


def _handle_ndarray(x, *, opts, name, snapshot=False):
    if np.issubdtype(x.dtype, np.number):
        if snapshot:
            with TemporaryDirectory() as f:
                fname = '{}/{}.npy'.format(f, name)
                mdaio.writenpy(x, fname, dtype=npy_dtype_to_string(x.dtype))
                return mt.createSnapshot(fname, upload_to=opts.get('upload_to', None))
        else:
            if (x.size > 1000):
                raise Exception(
                    'Array is too large to include in file (need to use snapshot). name={}, shape={}'.format(name, x.shape))
            list0 = [_handle_list_or_val(val, opts=opts, name=name)
                     for val in x.tolist()]
            return list0
    else:
        list0 = [_handle_list_or_val(val, opts=opts, name='{}.{}'.format(name, ind))
                 for ind, val in enumerate(x.tolist())]
        return list0


def _handle_dataset(ds: h5py.Dataset, *, opts, name, path):
    _attrs = _get_attrs(ds, opts=opts, name=name)
    if opts.get('exclude_data', None):
        _data = None
    else:
        _data = _handle_val(ds.value, opts=opts, name=name)
    ret = dict(
        _data=_data,
        _dataset_path=path,
        _shape=list(ds.shape),
        _dtype=ds.dtype.name
    )
    if len(_attrs.keys()) > 0:
        ret['_attrs'] = _attrs
    return ret


def _get_attrs(f, *, opts, name):
    attrs = dict()
    for key, val in dict(f.attrs).items():
        attrs[key] = _handle_val(val, opts=opts, name=key)
    return attrs


def _nwb_to_dict(f, *, opts, name, path):
    if opts.get('verbose', None):
        print('nwb_to_dict', name)
    _attrs = _get_attrs(f, opts=opts, name=name)
    _datasets = {}
    ret = {}
    for name0, item in f.items():
        path2 = path + '/' + name0
        if isinstance(item, h5py.Group):
            ret[name0] = _nwb_to_dict(item, opts=opts, name=name0, path=path2)
        elif isinstance(item, h5py.Dataset):
            _datasets[name0] = _handle_dataset(item, opts=opts, name=name0, path=path2)
        else:
            print('Unhandled item', type(item))
    if len(_attrs.keys()) > 0:
        ret['_attrs'] = _attrs
    if len(_datasets.keys()) > 0:
        ret['_datasets'] = _datasets
    ret['_path'] = path
    return ret


class NWBToDict(mlpr.Processor):
    NAME = 'NWBToDict'
    VERSION = '0.1.1'

    # Inputs
    h5_in = mlpr.Input()

    # Parameters
    upload_to = mlpr.StringParameter(optional=True, default='')

    # Outputs
    json_out = mlpr.Output()

    def run(self):
        upload_to = self.upload_to
        if not upload_to:
            upload_to = None
        x = nwb_to_dict(self.h5_in, upload_to=upload_to)
        with open(self.json_out, 'w') as f:
            simplejson.dump(x, f, ignore_nan=True)
