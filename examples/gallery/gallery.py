#!/usr/bin/env python

import argparse
import ephys_viz as ev
ev.init_electron()

def main():
    parser = argparse.ArgumentParser(description="View gallery of examples for ephys-viz")
    parser.add_argument('--port', help='Port for hosting the view', required=False, default=None)
    args = parser.parse_args()
    W = ev.Gallery(
        ev.ElectrodeGeometry.examples.from_geom_csv(),
        ev.TimeseriesView.examples.toy_example(),
        ev.SpikeRasterPlot.examples.toy_example(),
        ev.SpikeAmplitudePlot.examples.toy_example(),
        ev.PlaceField.examples.bon03(),
        ev.NWBFile.examples.EC2(),
        ev.NWBBrowser.examples.bon03(),
        ev.CorticalSurface.examples.EC2()
    )
    if args.port:
        W.host(port=args.port)
    else:
        W.show()

if __name__ == '__main__':
    main()
