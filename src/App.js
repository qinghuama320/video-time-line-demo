import { useRef, useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";

import "./App.css";
import Track from "./Track";

const initialTracks = [
  [
    {
      id: uuidv4(),
      start: 0,
      xInMouseDown: 0,
      duration: 40,
    },
    {
      id: uuidv4(),
      start: 150,
      xInMouseDown: 0,
      duration: 80,
    },
  ],
];

const generateClip = (left) => {
  const duration = Math.round(Math.random() * 100) + 10;
  const clip = {
    id: uuidv4(),
    start: Math.floor(left - duration / 2),
    xInMouseDown: 0,
    duration: duration,
  };

  return clip;
};

const reorder = (list, startIndex, endIndex, xNow) => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  removed.start = Math.floor(removed.start + xNow - removed.xInMouseDown);
  //removed.start = Math.floor(left);

  result.splice(endIndex, 0, removed);

  return result;
};

const move = (
  source,
  destination,
  droppableSource,
  droppableDestination,
  xNow
) => {
  const [removed] = source.splice(droppableSource.index, 1);
  removed.start = Math.floor(removed.start + xNow - removed.xInMouseDown);
  destination.splice(droppableDestination.index, 0, removed);
};

function App() {
  const [tracks, setTracks] = useState(initialTracks);

  const mouseXRef = useRef(0);

  const logMousePosition = useCallback((e) => {
    mouseXRef.current = e.clientX;
  }, []);
  useEffect(() => {
    window.addEventListener("mousemove", logMousePosition);
    return () => {
      window.removeEventListener("mousemove", logMousePosition);
    };
  }, [logMousePosition]);

  const onDragEnd = useCallback(
    (result) => {
      const { source, destination } = result;
      if (!destination) {
        return;
      }
      const sId = source.droppableId;
      const dId = destination.droppableId;

      if (sId === "add_clip_drop") {
        let dIdx;
        const clip = generateClip(mouseXRef.current || 0);
        if (dId === "track_start") {
          tracks.unshift([clip]);
        } else if (dId === "track_end") {
          tracks.push([clip]);
        } else if (dId.endsWith("blank_drog")) {
          dIdx = parseInt(dId) + 1;
          tracks.splice(dIdx, 0, [clip]);
        } else {
          dIdx = parseInt(dId);
          tracks[dIdx].splice(destination.index, 0, clip);
        }

        const newTracks = [...tracks];
        setTracks(newTracks.filter((track) => track.length));

        return;
      }

      if (sId === dId) {
        const trackIdx = parseInt(sId);
        const items = reorder(
          tracks[trackIdx],
          source.index,
          destination.index,
          mouseXRef.current
        );
        const newTracks = [...tracks];
        newTracks[trackIdx] = items;
        setTracks(newTracks);
      } else {
        let sIdx = parseInt(sId);
        let dIdx;
        if (dId === "track_start") {
          tracks.unshift([]);
          sIdx++;
          dIdx = 0;
        } else if (dId === "track_end") {
          tracks.push([]);
          dIdx = tracks.length - 1;
        } else if (dId.endsWith("blank_drog")) {
          dIdx = parseInt(dId) + 1;
          tracks.splice(dIdx, 0, []);
          sIdx = sIdx >= dIdx ? sIdx + 1 : sIdx;
        } else {
          dIdx = parseInt(dId);
        }
        move(
          tracks[sIdx],
          tracks[dIdx],
          source,
          destination,
          mouseXRef.current
        );
        const newTracks = [...tracks];

        setTracks(newTracks.filter((track) => track.length));
      }
    },
    [tracks]
  );

  const renderBlankDrog = useCallback(
    (id) => (
      <Droppable droppableId={id} key={id} direction="horizontal">
        {(droppableProvided) => (
          <div
            {...droppableProvided.droppableProps}
            ref={droppableProvided.innerRef}
          >
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    ),
    []
  );

  const getStyle = useCallback((style, snapshot) => {
    const newStyle = {
      ...style,
      background: snapshot.isDragging ? "lightgreen" : "white",
    };
    if (!snapshot.isDropAnimating) {
      return newStyle;
    }
    return {
      ...newStyle,
      // cannot be 0, but make it super tiny
      transitionDuration: `0.001s`,
    };
  }, []);

  const setClipInfo = useCallback(
    (trackIdx, clipIdx, width, left) => {
      const clip = tracks[trackIdx][clipIdx];
      if (!clip) {
        return;
      }
      if (clip.duration !== width || clip.start !== left) {
        clip.duration = width;
        clip.start = left;

        setTracks([...tracks]);
      }
    },
    [tracks]
  );

  const setClipInfoNoRender = useCallback(
    (trackIdx, clipIdx, xInMouseDown) => {
      const clip = tracks[trackIdx][clipIdx];
      clip.xInMouseDown = xInMouseDown;
    },
    [tracks]
  );

  const deleteClip = useCallback(
    (trackIdx, clipIdx) => {
      const track = tracks[trackIdx];
      track.splice(clipIdx, 1);

      const newTracks = [...tracks];
      setTracks(newTracks.filter((track) => track.length));
    },
    [tracks]
  );

  return (
    <DragDropContext
      onDragEnd={onDragEnd}
      //onDragStart={onDragStart}
      disableAutoScroll={true}
    >
      <div className="app">
        <h1>Video Editor Timeline</h1>
        <section className="tracks_wrap">
          {renderBlankDrog("track_start")}
          {tracks.map((track, idx) => [
            <Track
              key={`${idx}_track_${idx}`}
              clips={track}
              trackIdx={idx}
              droppableId={`${idx}_track_${idx}`}
              setClipInfo={setClipInfo}
              setClipInfoNoRender={setClipInfoNoRender}
              deleteClip={deleteClip}
            />,
            renderBlankDrog(
              idx < tracks.length - 1 ? `${idx}_blank_drog` : "track_end"
            ),
          ])}
        </section>
      </div>

      <Droppable droppableId={"add_clip_drop"} isDropDisabled={true}>
        {(droppableProvided) => (
          <div
            {...droppableProvided.droppableProps}
            ref={droppableProvided.innerRef}
            className="btn_wrap"
          >
            <span className="clip_button">drag to add a clip</span>
            <Draggable draggableId={"add_clip_drag"} index={9999}>
              {(draggableProvided, snapshot) => (
                <span
                  {...draggableProvided.draggableProps}
                  ref={draggableProvided.innerRef}
                  {...draggableProvided.dragHandleProps}
                  className="clip_button"
                  style={getStyle(
                    draggableProvided.draggableProps.style,
                    snapshot
                  )}
                >
                  drag to add a clip
                </span>
              )}
            </Draggable>
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default App;
