#!/usr/bin/env python

import ephys_viz as ev
ev.init_electron()

def main():
    X = ev.TwoPhotonSeries(
        nwb_path='sha1://3ea5732ebfca7fe2e3cd2ec7b731f3a492f06e6c/Sue_2x_3000_40_-46.nwb',
        download_from='spikeforest.public'
    )
    X.show()

if __name__ == '__main__':
    main()
