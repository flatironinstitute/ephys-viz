#!/usr/bin/env python

import ephys_viz as ev
ev.init_electron()

def main():
    X = ev.ElectrodeGeometry(
        path='sha1dir://0ba09f6658e767d4e70055773805a8d939a9a4c6.paired_mea64c/20160415_patch2/geom.csv',
        download_from='spikeforest.public'
    )

    X.show()

if __name__ == '__main__':
    main()
