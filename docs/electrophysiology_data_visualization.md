## Electrophysiology Data Visualization

Ben Dichter

You can organize visualizations by what data goes into them. For any one plot, you could have 1, 2, or 3 (or maybe more) different types of data that are used to generate that plot. Those data might be neural recordings, stimuli, or behavior. There are standard ways to visualize single data types and some combinations of data types. A common trend across data type is "trial-aligned" visualizations. Experiments are usually (but not always) split up into small "trials," which are controlled repetitions of a certain task (e.g. runs of a maze, presentations of a sound, arm reaches to a target, etc.), where some controlled variable is being repeated or precisely varied to study how that changes the response. To analyze trials, you generally take a window (e.g. -.5 to 1 second) of data around a certain time of each trial and stack these windows. Now you often average across trials that are the same trial condition (e.g. sound A vs sound B). Most visualization can be done across real-time or trial-time.

## 1 data type

### Local field potential (LFP).

LFPs are electrical potential recordings taken with implanted electrodes that are measuring voltage fluctuations in the extracellular fluid around neurons in the brain. The LFP is a name often reserved for a down-sampled and sometimes lowpass filtered voltage signal.

* Trace plots. The most common visualization is simply voltage over time as individual traces for each electrode.

* Periodograms show the amplitude of each band of a signal. This is commonly used to assess signal quality.Spectrograms show changes to frequency components of a signal over time. 

* Spectrograms can be trial-aligned.


### Action potentials. (aka spikes, firing).

Action potentials are firings of neurons that you can detect from the voltage signal, and are generally isolated from the signal and analyzed as a distinct signal.

* Spike rasters. Spikes are generally visualized as "ticks," which are small vertical lines. It is common to trial-align spike rasters, and show all trials for a given trial-condition stacked vertically. It is also common to include an average over these trials as a line graph below, which is often smoothed with a gaussian kernel. This type of graph is called a peri-stimulus time histogram (PSTH).

* Cross-correlelograms. For two neurons, you might show the co-occurrence of action potentials in a cross-correlelogram (xcorr), This shows something like "given that neuron1 fired at a specific time, how likely is it that neuron 2 fires at x lead/delay before/after that time?

* Spike waveforms. The waveform of the spikes of a neuron are sometimes of interest andare shown as traces.

### Neural activity

For many types of recordings, you get a signal that indirectly measures "neural activity," such as calcium fluctuations, BOLD responds, or high gamma of LFP. These are generally continuous valued and temporally continuous and can be presented as traces.

### Sound

* Sound Waveform. The simple sound waveform can be useful to visualize as a single trace.

* Spectrogram. Spectrogram is most common. This is often done using a specific filter bank, e.g. MFCCs

Visual Stimulus

* Presented images or video

### Behavior

* Position. Often there is some kind of position being tracked, whether it is articulator position, mouse position in a maze, monkey arm reaching position to targets on a screen, eye fixation position, etc. These types of plots usually show x and y as spatial x and y, and position is shown as a trace. Time can be indicated by line color or thickness, but is often lost/implied. Sometimes these values are shown in multiple plots of x vs time, y vs. time, etc., but this is less common.These can of course be trial-aligned

* Behavioral events. There are often behavioral events, e.g. licks, that are marked as a single time and are generally shown as a tick or a vertical line spanning the axes.

* Misc. behavior. Other behavior is often captured by video of animal

## 2-data-type

### Spike-triggered averages (STA). (APs, behavior or stimulus)

You can take any neuron and build windows around its action potential for any other timeseries data-type, including LFP, behavioralevent, stimulus.

### Evoked Response Potential (ERP). (behavior, stimulus x APs)

This is similar to STA, but you window around some sensory or behavioral event. If the ERP is locked to a sensory event that is in the start of each trial, this is just standard trial-aligning of a timeseries.Place field plot. (Position, APs) Discretize position and show the firing rate in each part.

### Receptive field. (stimulus or behavior, APs or “neural activation”)

A visualization of the weights of a linear regression (often regularized) relating APs or some "neural activation" measure to 11