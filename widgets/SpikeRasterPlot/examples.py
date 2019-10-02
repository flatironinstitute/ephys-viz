import spikeextractors as se
import ephys_viz as ev

class examples:
    @classmethod
    def toy_example(cls):
        _, sorting = se.example_datasets.toy_example()
        return ev.SpikeRasterPlot(
            title="Spike raster plot for toy example",
            sorting=sorting
        )