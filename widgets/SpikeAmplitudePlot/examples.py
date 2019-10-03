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
    @classmethod
    def franklab_example(cls):
        return ev.SpikeAmplitudePlot(
            title="Spike amplitude plot for franklab tetrode example",
            recording={
                "path": "sha1dir://b1618868a12e92d8fb5df2b60b34dc0716a40552.manual_franklab/tetrode_600s/sorter1_1/raw.mda",
                "samplerate": 30000,
                "download_from": "spikeforest.public"
            },
            sorting={
                "path": "sha1dir://b1618868a12e92d8fb5df2b60b34dc0716a40552.manual_franklab/tetrode_600s/sorter1_1/firings_true.mda",
                "samplerate": 30000,
                "download_from": "spikeforest.public"
            }
        )