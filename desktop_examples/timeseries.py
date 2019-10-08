#!/usr/bin/env python

import ephys_viz as ev
import spikeextractors as se
ev.init_electron()

def main():
    recording, sorting = se.example_datasets.toy_example()
    X = ev.TimeseriesView(
        recording=recording
    )

    X.show()

if __name__ == '__main__':
    main()
