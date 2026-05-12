import { Finger, FingerCurl, FingerDirection, GestureDescription } from 'fingerpose';

export const playGesture = new GestureDescription('play_stop_gesture');
playGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.5);
playGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 0.5);
playGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 0.5);
playGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 0.5);
playGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 0.5);
playGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);

export const previousGesture = new GestureDescription('previous_gesture');
previousGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.5);
previousGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 0.5);
previousGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 0.5);
previousGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 0.5);
previousGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 0.5);
previousGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
previousGesture.addDirection(Finger.Index, FingerDirection.HorizontalRight, 1.0);
previousGesture.addDirection(Finger.Middle, FingerDirection.HorizontalRight, 1.0);
previousGesture.addDirection(Finger.Ring, FingerDirection.HorizontalRight, 1.0);
previousGesture.addDirection(Finger.Pinky, FingerDirection.HorizontalRight, 1.0);

export const nextGesture = new GestureDescription('next_gesture');
nextGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.5);
nextGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 0.5);
nextGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 0.5);
nextGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 0.5);
nextGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 0.5);
nextGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
nextGesture.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 1.0);
nextGesture.addDirection(Finger.Middle, FingerDirection.HorizontalLeft, 1.0);
nextGesture.addDirection(Finger.Ring, FingerDirection.HorizontalLeft, 1.0);
nextGesture.addDirection(Finger.Pinky, FingerDirection.HorizontalLeft, 1.0);

export const submitGesture = new GestureDescription('submit_gesture');
submitGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.5);
submitGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 0.5);
submitGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 0.5);
submitGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 0.5);
submitGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 0.5);
submitGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);

export const discardGesture = new GestureDescription('discard_gesture');
discardGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.5);
discardGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 0.5);
discardGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 0.5);
discardGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 0.5);
discardGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 0.5);
discardGesture.addDirection(Finger.Thumb, FingerDirection.VerticalDown, 1.0);