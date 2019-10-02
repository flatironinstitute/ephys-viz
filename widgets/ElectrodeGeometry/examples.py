import spikeextractors as se
import ephys_viz as ev

class examples:
    @classmethod
    def from_geom_csv(cls):
        return ev.ElectrodeGeometry(
            title="Electrode geometry from geom.csv",
            path="sha1dir://0ba09f6658e767d4e70055773805a8d939a9a4c6.paired_mea64c/20160415_patch2/geom.csv",
            download_from="spikeforest.public"
        )