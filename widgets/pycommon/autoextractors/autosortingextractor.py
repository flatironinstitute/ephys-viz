from mountaintools import MountainClient
import spikeextractors as se
from .mdaextractors import MdaSortingExtractor

class AutoSortingExtractor(se.SortingExtractor):
    def __init__(self, arg):
        super().__init__()
        self._hash = None
        if isinstance(arg, se.SortingExtractor):
            self._sorting = arg
            self.copy_unit_properties(sorting=self._sorting)
        else:
            self._sorting = None
            self._client = MountainClient()
            if 'download_from' in arg:
                self._client.configDownloadFrom(arg['download_from'])
            if 'path' in arg:
                path = arg['path']
                if self._client.isFile(path):
                    file_path = self._client.realizeFile(path=path)
                    if not file_path:
                        raise Exception('Unable to realize file: {}'.format(file_path))
                    self._init_from_file(file_path, original_path=path, kwargs=arg)
                else:
                    raise Exception('Not a file: {}'.format(path))
            else:
                raise Exception('Unable to initialize sorting extractor')
    def _init_from_file(self, path: str, *, original_path: str, kwargs: dict):
        if original_path.endswith('.mda'):
            if 'samplerate' not in kwargs:
                raise Exception('Missing argument: samplerate')
            samplerate = kwargs['samplerate']
            self._sorting = MdaSortingExtractor(firings_file=path, samplerate=samplerate)
            hash0 = self._client.sha1OfObject(dict(
                firings_path=self._client.computeFileSha1(path),
                samplerate=samplerate
            ))
            setattr(self, 'hash', hash0)
        else:
            raise Exception('Unsupported format for {}'.format(original_path))
    
    def hash(self):
        if not self._hash:
            if hasattr(self._sorting, 'hash'):
                if type(self._sorting.hash) == str:
                    self._hash = self._sorting.hash
                else:
                    self._hash = self._sorting.hash()
            else:
                self._hash = _samplehash(self._sorting)
        return self._hash

    def get_unit_ids(self):
        return self._sorting.get_unit_ids()

    def get_unit_spike_train(self, **kwargs):
        return self._sorting.get_unit_spike_train(**kwargs)
    
    def get_sampling_frequency(self):
        return self._sorting.get_sampling_frequency()

def _samplehash(sorting):
    from mountaintools import client as mt
    obj = {
        'unit_ids': sorting.get_unit_ids(),
        'sampling_frequency': sorting.get_sampling_frequency(),
        'data': _samplehash_helper(sorting)
    }
    return mt.sha1OfObject(obj)


def _samplehash_helper(sorting):
    h = 0
    for id in sorting.get_unit_ids():
        st = sorting.get_unit_spike_train(unit_id=id)
        h = hash((hash(bytes(st)), hash(h)))
    return h