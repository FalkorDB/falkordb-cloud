import Spinning from "../components/spinning"

export enum State {
    Loaded,
    InitialLoading,
    BuildingSandbox,
    DestroyingSandbox,
}
  
export function LoadingState(props: { state: State }) {
  switch (props.state) {
    case State.InitialLoading:
      return <Spinning text="Loading Sandbox..." />
    case State.BuildingSandbox:
      return <Spinning text="Building the sandbox... (it might take a couple of minutes)" />
    case State.DestroyingSandbox:
      return <Spinning text="Destroying the sandbox..." />
    default:
        return <></>
  }
}