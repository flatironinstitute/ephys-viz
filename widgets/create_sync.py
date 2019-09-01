import uuid

def create_sync(*state_keys):
    return SyncObject(state_keys)

class SyncObject:
    def __init__(self, state_keys):
        self._id = uuid.uuid4().hex.upper()
        self._state_keys = state_keys

    def map(self, **kwargs):
        for key in kwargs:
            if key not in self._state_keys:
                raise Exception('Key not found in sync state keys: {}'.format(key))
        return dict(
            id=self._id,
            syncState=kwargs
        )

    def map_all(self):
        a = dict()
        for key in self._state_keys:
            a[key] = key
        return self.map(**a)