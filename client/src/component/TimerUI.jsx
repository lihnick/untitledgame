import React, { useState, useEffect, useRef } from 'react';

function TimerUI(props) {

  const [seconds, setSeconds] = useState(0);
  const [ticking, setTicking] = useState(false);

  useEffect(() => {
    if (props.seconds > 0) {
      console.log('Initial Seconds:', (props.seconds - Date.now()) / 1000);
      setSeconds((props.seconds - Date.now()) / 1000);
      setTicking(true);
    }
  }, [props]);

  useInterval(() => {
    setSeconds(seconds - 1);
    if (seconds <= 1) {
      setTicking(false);
    }
  }, ticking ? 1000 : null);

  const style = {
    'position': 'absolute',
    'top': '5%',
    'left': '50%',
    'transform': 'translate(-50%, -50%)'
  }
  return (
    <React.Fragment>
      {seconds > 0 && <div style={style}>{props.description} {Math.round(seconds)}</div>}
    </React.Fragment>
  );
}

function useInterval(callback, delay) {
  // ref (presist after re-render) stores a mutable variable that points to the latest callback
  // so the variables used in the callback will have the latest react render values
  const updatedCallback = useRef();

  useEffect(() => {
    updatedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      updatedCallback.current();
    }
    // passing null as delay will pause the interval
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default TimerUI;