import React from 'react';
import Scene from './Scene';
import style from './Home.scss';

const Home = () => {
  const ref = React.useRef();

  React.useEffect(() => {
    const scene = new Scene(ref.current);

    return () => {
      scene.destroyListener();
    };
  }, [ref]);

  return (
    <div className={style.root}>
      <div className={style.container}>
        <div className={style.imageWrapper} ref={ref} />
      </div>
    </div>
  );
};

export default Home;
