import { useEffect, useState, useCallback, useRef } from "react";
import { Draggable } from "react-beautiful-dnd";
import useThrottledEffect from "use-throttled-effect";

export default function Clip({
  clip,
  trackIdx,
  index,
  setClipInfo,
  setClipInfoNoRender,
  deleteClip,
}) {
  const [width, setWidth] = useState(clip.duration);
  const [left, setLeft] = useState(clip.start);
  const [isClipDraggable, setDraggable] = useState(true);

  //const clipLeftRef = useRef(left);

  const xStart = left + 10;
  const xEnd = xStart + width;

  useEffect(() => {
    setWidth(clip.duration);
    setLeft(clip.start);
  }, [clip.duration, clip.start]);

  const setClipInfoInner = () => {
    setClipInfo(trackIdx, index, width, left);
  };

  useThrottledEffect(setClipInfoInner, 1000, [width, left]);

  // 下面6个函数是为了伸缩clip的宽度。定义了一个最小宽度10，用于展示左右两个伸缩锚点，否则下次无法使用
  const mouseMove = useCallback(
    (e) => {
      const x = e.clientX;
      const xDelt = x - xStart;

      setLeft(x - 10);
      const w = width - xDelt;
      setWidth(w < 10 ? 10 : w);
    },
    [xStart, width]
  );

  const rightMouseMove = useCallback(
    (e) => {
      const x = e.clientX;
      const xDelt = x - xEnd;

      const w = width + xDelt;
      setWidth(w < 10 ? 10 : w);
    },
    [xEnd, width]
  );

  const mouseUp = useCallback(() => {
    setDraggable(true);
    window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("mouseup", mouseUp);
  }, [mouseMove]);

  const rightMouseUp = useCallback(() => {
    setDraggable(true);
    window.removeEventListener("mousemove", rightMouseMove);
    window.removeEventListener("mouseup", rightMouseUp);
  }, [rightMouseMove]);

  const mouseDown = useCallback(() => {
    setDraggable(false);
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);
  }, [mouseMove, mouseUp]);

  const rightMouseDown = useCallback(() => {
    setDraggable(false);
    window.addEventListener("mousemove", rightMouseMove);
    window.addEventListener("mouseup", rightMouseUp);
  }, [rightMouseMove, rightMouseUp]);

  const getItemStyle = useCallback(
    (clipWidth, clipLeft, snapshot, draggableStyle) => {
      const newStyle = {
        userSelect: "none",
        background: snapshot.isDragging ? "lightgreen" : "white",
        width: `${clipWidth}px`,

        // styles we need to apply on draggables
        ...draggableStyle,
      };

      //if (snapshot.isDragging) {
      //  const { transform } = draggableStyle;
      //  const xy = transform?.match(/-?\d+px/g);
      //  if (xy && xy.length) {
      //    const newLeft = parseInt(xy[0]) + clipLeft; // 有bug，鼠标放开的时候会突然跳跃，放弃这种方案
      //    clipLeftRef.current = newLeft;
      //    //}
      //  }
      //}

      if (!snapshot.isDropAnimating) {
        return newStyle;
      } else {
        //setClipInfoInner(clipLeftRef.current);
        //clipLeftRef.current = null;
        return {
          ...newStyle,
          // cannot be 0, but make it super tiny
          transitionDuration: `0.001s`,
        };
      }
    },
    []
  );

  const clipMouseDown = useCallback(
    // 记录开始拖动clip时的X轴，然后mouseUp的时候再记录X轴，就可以知道clip拖动的横向距离，然后与起始left相加，就可以得到最后的位置
    // 但是mouseUp居然不生效，所以在App.js中用mousemove一直记录最后的位置，在DragEnd的时候取最后位置，也可以算出拖动的横向距离，
    (e) => {
      setClipInfoNoRender(trackIdx, index, e.clientX);
    },
    [trackIdx, index]
  );

  return (
    <li className="clip" style={{ left, width: `${width}px` }}>
      <span
        className="move-line left-line"
        onMouseDown={mouseDown}
        onMouseUp={setClipInfoInner}
      />
      <span
        className="move-line right-line"
        onMouseDown={rightMouseDown}
        //onMouseUp={() => setClipInfoInner()}
        // right的onMouseUp不响应，太奇怪了；左侧的可以
      />
      <span className="remove" onClick={() => deleteClip(trackIdx, index)}>
        X
      </span>

      <Draggable
        draggableId={clip.id}
        index={index}
        isDragDisabled={!isClipDraggable}
      >
        {(draggableProvided, snapshot) => (
          <span
            {...draggableProvided.draggableProps}
            ref={draggableProvided.innerRef}
            {...draggableProvided.dragHandleProps}
            className="clip_inner"
            id={clip.id}
            onMouseDown={clipMouseDown}
            style={getItemStyle(
              width,
              left,
              snapshot,
              draggableProvided.draggableProps.style
            )}
          >
            {clip.id}
          </span>
        )}
      </Draggable>
    </li>
  );
}
