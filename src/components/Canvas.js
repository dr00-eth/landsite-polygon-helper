import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image, Rect, Transformer } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import { createPortal } from 'react-dom';

const Canvas = ({ image, rectangles, setRectangles }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [clipboard, setClipboard] = useState(null);
  const [unitInput, setUnitInput] = useState('');
  const imageRef = useRef(null);
  const stageRef = useRef(null);
  const [editingUnit, setEditingUnit] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (image) {
      const img = new window.Image();
      img.src = image;
      img.onload = () => {
        imageRef.current = img;
        setStageSize({
          width: img.width,
          height: img.height,
        });
        if (stageRef.current) {
          stageRef.current.size({ width: img.width, height: img.height });
        }
      };
    }
  }, [image]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCopyShortcut = (e.ctrlKey || e.metaKey) && e.key === 'c';
      const isPasteShortcut = (e.ctrlKey || e.metaKey) && e.key === 'v';
      const isDeleteKey = e.key === 'Delete' || e.key === 'Backspace';

      if (isCopyShortcut && selectedId && !editingUnit) {
        const selectedRect = rectangles.find(r => r.id === selectedId);
        if (selectedRect) {
          setClipboard({ ...selectedRect });
        }
      } else if (isPasteShortcut && clipboard && !editingUnit) {
        const newRect = {
          ...clipboard,
          id: uuidv4(),
          x: clipboard.x + 10,
          y: clipboard.y + 10,
          unit: clipboard.unit + 1,
        };
        setRectangles([...rectangles, newRect]);
        setSelectedId(newRect.id);
      } else if (isDeleteKey && selectedId && !editingUnit) {
        setRectangles(rectangles.filter(rect => rect.id !== selectedId));
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rectangles, selectedId, clipboard, editingUnit, setRectangles]);

  const handleStageClick = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
      setEditingUnit(false);
    } else {
      const clickedRectId = e.target.id();
      if (clickedRectId !== selectedId) {
        setSelectedId(clickedRectId);
        setEditingUnit(false);
      } else {
        setEditingUnit(true);
      }
    }
  };

  const handleStageDblClick = (e) => {
    if (!stageRef.current) return;

    const pos = stageRef.current.getPointerPosition();
    const newRectangle = {
      id: uuidv4(),
      x: pos.x,
      y: pos.y,
      width: 100,
      height: 50,
      rotation: 0,
      fill: 'rgba(0,0,0,0.5)',
      stroke: 'black',
      strokeWidth: 2,
      unit: rectangles.length + 1,
    };
    setRectangles([...rectangles, newRectangle]);
    setSelectedId(newRectangle.id);
    setEditingUnit(false);
  };

  const handleUnitInputChange = (e) => {
    setUnitInput(e.target.value);
  };

  const updateRectangleUnit = () => {
    const updatedRectangles = rectangles.map(rect =>
      rect.id === selectedId ? { ...rect, unit: parseInt(unitInput, 10) || rect.unit } : rect
    );
    setRectangles(updatedRectangles);
  };

  const selectedRectangle = rectangles.find(r => r.id === selectedId);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Stage 
        ref={stageRef}
        width={stageSize.width} 
        height={stageSize.height}
        onClick={handleStageClick}
        onDblClick={handleStageDblClick}
        style={{ border: '1px solid black' }}
      >
        <Layer>
          {imageRef.current && (
            <Image
              image={imageRef.current}
              width={stageSize.width}
              height={stageSize.height}
            />
          )}
          {rectangles.map((rect) => (
            <Rectangle
              key={rect.id}
              shapeProps={rect}
              isSelected={rect.id === selectedId}
              onSelect={() => {
                setSelectedId(rect.id);
                setUnitInput(rect.unit ? rect.unit.toString() : '');
              }}
              onChange={(newAttrs) => {
                const rects = rectangles.slice();
                const index = rects.findIndex((r) => r.id === rect.id);
                rects[index] = newAttrs;
                setRectangles(rects);
              }}
            />
          ))}
        </Layer>
      </Stage>
      {selectedRectangle && editingUnit && (
        createPortal(
          <input
            type="text"
            ref={inputRef}
            value={unitInput}
            onChange={handleUnitInputChange}
            onBlur={() => {
              updateRectangleUnit();
              setEditingUnit(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateRectangleUnit();
                setEditingUnit(false);
              } else if (e.key === 'Escape') {
                setEditingUnit(false);
              }
              e.stopPropagation();
            }}
            style={{
              position: 'absolute',
              top: `${selectedRectangle.y + selectedRectangle.height + 10}px`,
              left: `${selectedRectangle.x + 200}px`,
              width: '100px',
            }}
            autoFocus
          />,
          document.body
        )
      )}
    </div>
  );
};

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default Canvas;
