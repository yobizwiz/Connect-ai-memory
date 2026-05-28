# Knowledge Guide: Web Audio & SVG Performance Tuning for Interactive Dashboards

This guide establishes the performance optimization criteria, garbage collection routines, and GPU acceleration rules required to maintain a 60fps responsive experience when running intensive UI layers.

---

## 🔊 1. Web Audio Context & Garbage Collection Management

Standard desktop and mobile browsers restrict the number of active, concurrent `AudioContext` instances (typically **maximum 6 contexts** per page). Unmanaged contexts lead to memory leaks, browser warnings, and eventual audio freezing.

### Core Optimization Guidelines
1. **The Single-Context Rule (Singleton):** Do not create a new `AudioContext` on every action. Instantiated nodes (e.g., oscillators, gain controls) should be connected and disconnected from a single, persistent context.
2. **Suspension Protocol:** Suspend the audio context when not actively playing a warning beep or siren. This turns off the system processing thread, saving CPU resources.
3. **Garbage Collection (GC):** Explicitly call `.stop()` on finished sound sources, disconnect them from the routing graph, and nullify references to allow browser GC to reclaim the memory blocks.

### Optimized Audio Engine Structure (JavaScript)
```javascript
class ComplianceAudioEngine {
    constructor() {
        this.ctx = null;
        this.mainGain = null;
        this.activeOscillators = new Set();
    }

    lazyInit() {
        if (this.ctx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();
        
        // Setup central gain node
        this.mainGain = this.ctx.createGain();
        this.mainGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.mainGain.connect(this.ctx.destination);
    }

    playAlertTone(frequency, duration) {
        this.lazyInit();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.mainGain);

        osc.start();
        this.activeOscillators.add(osc);

        // Safe Clean Up & GC release
        setTimeout(() => {
            try {
                osc.stop();
                osc.disconnect();
                gain.disconnect();
                this.activeOscillators.delete(osc);
                
                // Suspend context if no active oscillations remain
                if (this.activeOscillators.size === 0) {
                    this.ctx.suspend();
                }
            } catch(e) {
                console.warn("Audio clean-up error", e);
            }
        }, (duration + 0.1) * 1000);
    }
}
```

---

## 🎨 2. GPU-Accelerated SVG Filters & Glitch Compositing

Applying SVG effects like `feDisplacementMap`, `feTurbulence`, or high-frequency `.glitch` animations can trigger continuous **CPU re-paint storms** that tank rendering performance to under 15fps.

### GPU Compositing Directives
- **Force Hardware Acceleration:** Force the browser to promote glitched layers to their own GPU-composited compositing plane using 3D transforms:
  ```css
  .glitch-active {
      transform: translate3d(0, 0, 0);
      backface-visibility: hidden;
      will-change: transform, filter;
  }
  ```
- **Filter Resolution Caps:** Do not apply heavy filters like `feTurbulence` or `feTile` directly on full-screen containers. Apply them strictly on localized elements (e.g. only text elements, localized warning boxes) to limit the compositing rectangle size.

---

## 📱 3. Responsive Low-End Device Fallbacks

To ensure smooth access across low-power mobile devices and unstable network environments, the UI must support graceful feature degradation.

### Culpability Diagnostics (HTML5 Detection)
```javascript
function detectPerformanceTier() {
    // 1. Check hardware concurrency (CPU Cores)
    const cores = navigator.hardwareConcurrency || 4;
    // 2. Check network latency/quality
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlowConnection = connection && (connection.saveData || ['slow-2g', '2g', '3g'].includes(connection.effectiveType));
    
    if (cores < 4 || isSlowConnection) {
        return 'LOW_TIER';
    }
    return 'HIGH_TIER';
}

// Graceful Degradation Action
const tier = detectPerformanceTier();
if (tier === 'LOW_TIER') {
    console.log("⚡ [Performance Guard] Degrading interactive elements for low-end hardware.");
    
    // Disable intensive SVG filter overlays
    document.querySelector('svg')?.classList.add('hidden');
    
    // Fall back to standard CSS animation classes (eliminate constant translation repaints)
    document.querySelectorAll('.glitch-text').forEach(el => {
        el.style.animation = 'none'; // Turn off constant skewed keyframes
    });
}
```
