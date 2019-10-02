import spikeextractors as se
import ephys_viz as ev

class examples:
    @classmethod
    def toy_example(cls):
        recording, sorting = se.example_datasets.toy_example()
        return ev.SpikeAmplitudePlot(
            title="Spike amplitude plot for toy example",
            recording=recording,
            sorting=sorting
        )