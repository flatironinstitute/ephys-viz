import spikeextractors as se
import ephys_viz as ev

class examples:
    @classmethod
    def bon03(cls):
        return ev.NWBBrowser(
            title="NWBBrowser for bon03",
            path="sha1://ee3264cbd2ad0db9e4ea12db5902bc788cc934c5/bon03.nwb.json",
            download_from="spikeforest.public"
        )