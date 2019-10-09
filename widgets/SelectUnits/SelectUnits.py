import traceback
from ..pycommon.autoextractors import AutoSortingExtractor


class SelectUnits:
    def __init__(self):
        super().__init__()

    def javascript_state_changed(self, prev_state, state):
        self._set_status('running', 'Running SelectUnits')

        sorting0 = state.get('sorting', None)
        if not sorting0:
            self._set_error('Missing: sorting')
            return
        try:
            self._sorting = AutoSortingExtractor(sorting0)
        except Exception as err:
            traceback.print_exc()
            self._set_error('Problem initiating sorting: {}'.format(err))
            return
        
        self._set_state(
            unit_ids=self._sorting.get_unit_ids(),
            status='finished',
            status_message='finished'
        )

    def _set_state(self, **kwargs):
        self.set_state(kwargs)
    
    def _set_error(self, error_message):
        self._set_status('error', error_message)
    
    def _set_status(self, status, status_message=''):
        self._set_state(status=status, status_message=status_message)