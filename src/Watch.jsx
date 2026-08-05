import { useParams } from "react-router-dom";

export default function Watch() {
  const { id } = useParams();

  return (
    <div className="watch">

      <iframe
        title="player"
        src={`https://vidsync.live/embed/movie/${id}`}
        allowFullScreen
      />

    </div>
  );
}