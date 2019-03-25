import React, { useRef, useEffect, useMemo } from 'react';
import { Polygon, Tooltip } from 'react-leaflet';

import { coordsToLatLngs, fromJS } from 'utils/geo';
import { AnnotationShapes } from './types';
import 'leaflet-editable';

const CustomTypePolygon: any = Polygon;

const okEvents = [
  'editable:vertex:dragend',
  'editable:dragend',
  'editable:vertex:deleted',
  'editable:vertex:new',
].join(' ');

const AnnotationPolygon: React.SFC<AnnotationShapes> = (props) => {
  const {annotation, onEdit, selected, onClick} = props;
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const ref = useRef<any>(null);
  const position = useMemo(() => coordsToLatLngs(
    coords,
    geometry.type === 'Polygon' ? 1 : 2,
  ).toJS(), [selected]);

  useEffect(() => {
    if (ref.current && ref.current.leafletElement && ref.current.leafletElement.dragging) {
      const save = () => {
        onEdit(
          annotation,
          fromJS(ref.current.leafletElement.toGeoJSON()).set(
            'properties',
            annotation.properties,
          ),
        );
      };
      ref.current.leafletElement.on(okEvents, save);
      return () => {
        ref.current.leafletElement.off(okEvents, save);
      };
    }
    return () => {};
  }, [annotation]);

  useEffect((): any => {
    if (ref.current && ref.current.leafletElement && ref.current.leafletElement.dragging) {
      if (!selected) {
        try {
          ref.current.leafletElement.disableEdit();
          ref.current.leafletElement.dragging.disable();
        } catch (e) {
          console.log('only on reload');
        }
      } else {
        try {
          ref.current.leafletElement.enableEdit();
          ref.current.leafletElement.dragging.enable();
        } catch (e) {
          console.log('only on reload');
        }
      }
    }
  }, [selected, ref]);

  return (
    <CustomTypePolygon
      onClick={onClick}
      color={selected ? 'cyan' : 'purple'}
      ref={ref}
      draggable
      edditable
      positions={position}
    >
      {!selected && (
        <Tooltip opacity={1} permanent>
          {annotation.properties.content}
        </Tooltip>
      )}
    </CustomTypePolygon>
  );
};

export default AnnotationPolygon;