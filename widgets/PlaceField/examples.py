import spikeextractors as se
import ephys_viz as ev

class examples:
    @classmethod
    def bon03(cls):
        return ev.PlaceField(
            title="Place field for bon03",
            nwb_query=dict(
                path="sha1://a713cb31d505749f7a15c3ede21a5244a3f5a4d9/bon03.nwb",
                epochs=[1]
            ),
            download_from="spikeforest.public"
        )