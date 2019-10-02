import spikeextractors as se
import ephys_viz as ev

class examples:
    @classmethod
    def EC2(cls):
        return ev.NWBFile(
            title="View EC2.nwb",
            path="sha1://e8414b711599a066e6cc9d2df34b0c3783c8b6f7/EC2.nwb",
            download_from="spikeforest.public"
        )