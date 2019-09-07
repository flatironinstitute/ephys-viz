import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkOpenGLRenderWindow from 'vtk.js/Sources/Rendering/OpenGL/RenderWindow';
import vtkRenderWindow from 'vtk.js/Sources/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from 'vtk.js/Sources/Rendering/Core/RenderWindowInteractor';
import vtkRenderer from 'vtk.js/Sources/Rendering/Core/Renderer';
import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkPolyData from 'vtk.js/Sources/Common/DataModel/PolyData';

import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';
import {
    ColorMode,
    ScalarMode,
} from 'vtk.js/Sources/Rendering/Core/Mapper/Constants';

export default class Surface {
    constructor(vertices, faces, scalars, opts) {
        const renderWindow = vtkRenderWindow.newInstance();
        const renderer = vtkRenderer.newInstance({ background: [0.2, 0.3, 0.4] });
        renderWindow.addRenderer(renderer);

        // ----------------------------------------------------------------------------
        // reader --> source --> mapper --> actor --> renderer -> render window
        // ----------------------------------------------------------------------------

        let points_values = [];
        for (let i=0; i<vertices.length; i++) {
            for (let j=0; j<3; j++) {
                points_values.push(vertices[i][j]);
            }
        }

        // The following is very helpful: https://kitware.github.io/vtk-js/docs/structures_PolyData.html
        let poly_init = {
            points: {
                vtkClass: 'vtkPoints',
                numberOfComponents: 3,
                size: vertices.length,
                dataType: 'Float32Array',
                values: Float32Array.from(points_values)
            },
            polys: {
                vtkClass: 'vtkCellArray',
                dataType: 'Uint32Array',
                values: Uint32Array.from(faces)
            }
        }
        if (scalars) {
            poly_init.pointData = {
                vtkClass: "vtkDataSetAttributes",
                arrays: [
                    {
                        data: {
                            vtkClass: "vtkDataArray",
                            name: "scalars",
                            numberOfComponents: 1,
                            size: vertices.length,
                            values: Float32Array.from(scalars)
                        }
                    }
                ]
            }
        }
        const polyData = new vtkPolyData.newInstance(poly_init);
        
        const source = polyData;

        const lookupTable = vtkColorTransferFunction.newInstance();
        const preset = vtkColorMaps.getPresetByName(opts.presetColorMapName || 'erdc_rainbow_bright');
        lookupTable.applyColorMap(preset);
        let vectorComponent = ('vectorComponent' in opts) ? opts.vectorComponent : -1;
        if (vectorComponent >= 0) {
            lookupTable.setVectorModeToComponent();
            lookupTable.setVectorComponent(vectorComponent);
        }
        else {
            lookupTable.setVectorModeToMagnitude();
        }
        window.debug_source = source;
        const mapper = vtkMapper.newInstance({
            scalarVisibility: (scalars ? true : false),  // whether scalar data is used to color objects
            interpolateScalarsBeforeMapping: true, // not sure I understand this
            useLookupTableScalarRange: true, // whether the mapper sets the lookuptable range based on its own ScalarRange,
            lookupTable, // used to map scalars into colors
            colorByArrayName: (scalars ? 'scalars' : undefined), // the array name to do the coloring -- I think it's source.getPointData().getArray(colorByArrayName)
            colorMode: ColorMode.MAP_SCALARS, // not sure I understand this. Affects how scalars are sent to the lookup table
            scalarMode: ScalarMode.USE_POINT_FIELD_DATA // whether to use point data, cell data, or other
        });
        

        mapper.setInputData(source);

        if (scalars) {
            const dataRange = source.getPointData().getArray('scalars').getRange(0);
            lookupTable.setMappingRange(dataRange[0], dataRange[1]);
            lookupTable.updateRange();
        }

        const actor = vtkActor.newInstance();
        actor.setMapper(mapper);

        renderer.addActor(actor);
        renderer.resetCamera();

        const openglRenderWindow = vtkOpenGLRenderWindow.newInstance();
        renderWindow.addView(openglRenderWindow);

        this.openglRenderWindow = openglRenderWindow;
    }
    setContainer(container) {
        this.openglRenderWindow.setContainer(container);

        // ----------------------------------------------------------------------------
        // Capture size of the container and set it to the renderWindow
        // ----------------------------------------------------------------------------

        const { width, height } = container.getBoundingClientRect();
        this.openglRenderWindow.setSize(width, height);

        // ----------------------------------------------------------------------------
        // Setup an interactor to handle mouse events
        // ----------------------------------------------------------------------------

        const interactor = vtkRenderWindowInteractor.newInstance();
        interactor.setView(this.openglRenderWindow);
        interactor.initialize();
        interactor.bindEvents(container);

        // ----------------------------------------------------------------------------
        // Setup interactor style to use
        // ----------------------------------------------------------------------------

        interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());
    }
}