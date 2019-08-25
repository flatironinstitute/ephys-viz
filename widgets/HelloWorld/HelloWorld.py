from reactopya import Component
import time

class HelloWorld(Component):
    def __init__(self):
        super().__init__()

    def javascript_state_changed(self, prev_state, state):
        self.set_python_state(dict(status='running', status_message='Running'))

        time.sleep(.5)

        self.set_python_state(dict(
            status='finished',
            status_message='finished'
        ))