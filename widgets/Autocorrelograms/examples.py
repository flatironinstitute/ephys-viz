import spikeextractors as se
import ephys_viz as ev

class examples:
    @classmethod
    def toy_example(cls):
        _, sorting = se.example_datasets.toy_example()
        return ev.Autocorrelograms(
            title="Autocorrelograms from SpikeExtractors toy example",
            sorting=sorting,
            max_samples=10000,
            max_dt_msec=150,
            bin_size_msec=6
        )
    @classmethod
    def spikeforest_mea_c30(cls):
        return ev.Autocorrelograms(
            title="Autocorrelograms from spikeforest mea_c30",
            sorting=dict(
                path="sha1dir://ed0fe4de4ef2c54b7c9de420c87f9df200721b24.synth_visapy/mea_c30/set1/firings_true.mda",
                samplerate=30000,
                download_from='spikeforest.public'
            ),
            max_samples=10000,
            max_dt_msec=150,
            bin_size_msec=2
        )