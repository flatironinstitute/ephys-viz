import spikeextractors as se
import ephys_viz as ev

class examples:
    @classmethod
    def toy_example(cls):
        recording, sorting = se.example_datasets.toy_example()
        return ev.TimeseriesView(
            title="Ephys recording from SpikeExtractors toy example",
            recording=recording
        )
    # need to load the geom for the following:
    # @classmethod
    # def spikeforest_synth_magland(cls):
    #     return ev.TimeseriesView(
    #         title="Ephys recording from spikeforest - synth_magland 8 chan",
    #         recording=dict(
    #             path="sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C8/001_synth/raw.mda",
    #             samplerate=30000,
    #             download_from="spikeforest.public"
    #         )
    #     )