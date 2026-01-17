import { useEffect, useRef, useState } from 'react'

export interface GamepadActions {
  onLeft?: () => void
  onRight?: () => void
  onUp?: () => void
  onDown?: () => void
  onSelect?: () => void // Cross [X] / A
  onBack?: () => void // Circle [O] / B
  onActionSquare?: () => void // Square [ ] / X
  onActionTriangle?: () => void // Triangle [/\ ] / Y
  onPrevTab?: () => void // L1
  onNextTab?: () => void // R1
}

export function useGamepad(actions: GamepadActions, isModalOpen: boolean = false) {
  const [gamepadConnected, setGamepadConnected] = useState(false)
  const [gamepadName, setGamepadName] = useState('')
  const lastInputTime = useRef<number>(0)
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  const triggerRumble = () => {
    try {
      const gamepads = navigator.getGamepads?.()
      if (!gamepads) return
      for (const gp of gamepads) {
        if (gp && 'vibrationActuator' in gp && gp.vibrationActuator) {
          // Subtle haptic pulse
          ;(gp.vibrationActuator as { playEffect: (type: string, options: unknown) => Promise<unknown> })
            .playEffect('dual-rumble', {
              startDelay: 0,
              duration: 35,
              weakMagnitude: 0.25,
              strongMagnitude: 0.1,
            })
            .catch(() => {})
        }
      }
    } catch {
      // Safe fallback
    }
  }

  useEffect(() => {
    const handleConnected = (e: GamepadEvent) => {
      setGamepadConnected(true)
      let name = e.gamepad.id
      if (name.includes('Wireless Controller') || name.includes('DualSense')) {
        name = 'PlayStation DualSense'
      } else if (name.includes('DualShock')) {
        name = 'PlayStation DualShock'
      } else if (name.includes('Xbox')) {
        name = 'Xbox Controller'
      } else {
        name = 'Gamepad'
      }
      setGamepadName(name)
    }

    const handleDisconnected = () => {
      const gamepads = navigator.getGamepads?.()
      const anyRemaining = Array.from(gamepads || []).some((gp) => gp !== null)
      if (!anyRemaining) {
        setGamepadConnected(false)
        setGamepadName('')
      }
    }

    window.addEventListener('gamepadconnected', handleConnected)
    window.addEventListener('gamepaddisconnected', handleDisconnected)

    // Initial check
    if (navigator.getGamepads) {
      const gps = navigator.getGamepads()
      for (const gp of gps) {
        if (gp) {
          setGamepadConnected(true)
          setGamepadName(gp.id.includes('Dual') ? 'PlayStation Controller' : 'Gamepad')
          break
        }
      }
    }

    return () => {
      window.removeEventListener('gamepadconnected', handleConnected)
      window.removeEventListener('gamepaddisconnected', handleDisconnected)
    }
  }, [])

  useEffect(() => {
    if (isModalOpen) return // pause dashboard gamepad navigation when in-game emulator is active

    let animId: number
    const buttonStates = new Map<number, boolean>()

    const pollGamepad = (time: number) => {
      const gamepads = navigator.getGamepads?.()
      if (gamepads) {
        const gp = Array.from(gamepads).find((g) => g !== null && g.connected)
        if (gp) {
          const now = time
          const debounceMs = 180

          // Axes (Left stick)
          const axisX = gp.axes[0] || 0
          const axisY = gp.axes[1] || 0
          const deadzone = 0.45

          // Buttons
          const isPressed = (btnIndex: number) => {
            const btn = gp.buttons[btnIndex]
            return btn ? (typeof btn === 'object' ? btn.pressed : btn === 1.0) : false
          }

          // D-Pad buttons
          const dpadUp = isPressed(12) || axisY < -deadzone
          const dpadDown = isPressed(13) || axisY > deadzone
          const dpadLeft = isPressed(14) || axisX < -deadzone
          const dpadRight = isPressed(15) || axisX > deadzone

          // Navigation (Debounced directional repeat)
          if (now - lastInputTime.current > debounceMs) {
            if (dpadLeft) {
              actionsRef.current.onLeft?.()
              triggerRumble()
              lastInputTime.current = now
            } else if (dpadRight) {
              actionsRef.current.onRight?.()
              triggerRumble()
              lastInputTime.current = now
            } else if (dpadUp) {
              actionsRef.current.onUp?.()
              triggerRumble()
              lastInputTime.current = now
            } else if (dpadDown) {
              actionsRef.current.onDown?.()
              triggerRumble()
              lastInputTime.current = now
            }
          }

          // Face Buttons (Single press edge detection)
          const checkEdge = (idx: number, callback?: () => void) => {
            const pressed = isPressed(idx)
            const wasPressed = buttonStates.get(idx) || false
            if (pressed && !wasPressed) {
              callback?.()
              triggerRumble()
            }
            buttonStates.set(idx, pressed)
          }

          // 0: Cross [X]
          checkEdge(0, actionsRef.current.onSelect)
          // 1: Circle [O]
          checkEdge(1, actionsRef.current.onBack)
          // 2: Square [ ]
          checkEdge(2, actionsRef.current.onActionSquare)
          // 3: Triangle [/\ ]
          checkEdge(3, actionsRef.current.onActionTriangle)
          // 4: L1
          checkEdge(4, actionsRef.current.onPrevTab)
          // 5: R1
          checkEdge(5, actionsRef.current.onNextTab)
        }
      }

      animId = requestAnimationFrame(pollGamepad)
    }

    animId = requestAnimationFrame(pollGamepad)
    return () => cancelAnimationFrame(animId)
  }, [isModalOpen])

  return { gamepadConnected, gamepadName }
}
