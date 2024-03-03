import { Droppable } from "react-beautiful-dnd";
import Clip from "./Clip";

export default function Track({
  clips,
  trackIdx,
  droppableId,
  setClipInfo,
  setClipInfoNoRender,
  deleteClip,
}) {
  return (
    <Droppable
      droppableId={droppableId}
      direction="horizontal"
      disableTransition={true}
    >
      {(droppableProvided) => (
        <ul
          {...droppableProvided.droppableProps}
          ref={droppableProvided.innerRef}
          className="track"
        >
          {clips.map((clip, index) => (
            <Clip
              clip={clip}
              key={clip.id}
              trackIdx={trackIdx}
              index={index}
              setClipInfo={setClipInfo}
              setClipInfoNoRender={setClipInfoNoRender}
              deleteClip={deleteClip}
            />
          ))}
          {droppableProvided.placeholder}
        </ul>
      )}
    </Droppable>
  );
}
