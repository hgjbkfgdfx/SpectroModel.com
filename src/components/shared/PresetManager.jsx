import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Star, Download, Upload, Trash2, Plus, Settings } from 'lucide-react';

export default function PresetManager({ onPresetSelect, currentSettings }) {
  const [presets, setPresets] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [presetName, setPresetName] = useState('');
  const [presetSettings, setPresetSettings] = useState({
    lufs_target: -14.0,
    compression: {
      enabled: true,
      threshold: -18,
      ratio: 3.0,
      attack: 5,
      release: 50,
      makeup_gain: 2.0
    },
    eq: {
      high_shelf: {
        enabled: true,
        frequency: 8000,
        gain: 3.0
      },
      low_shelf: {
        enabled: false,
        frequency: 80,
        gain: 0
      }
    },
    deessing: {
      enabled: false,
      frequency: 6000,
      threshold: -15,
      reduction: 6
    },
    stereo_widening: {
      enabled: false,
      width: 1.2
    },
    limiter: {
      enabled: true,
      ceiling: -0.3,
      release: 50
    }
  });

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const userPresets = await base44.entities.DSPPreset.list('-created_date');
      setPresets(userPresets || []);
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  };

  const savePreset = async () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    try {
      const preset = {
        preset_name: presetName,
        settings: presetSettings,
        preset_type: 'user',
        description: 'Custom mastering preset',
        tags: ['mastering', 'custom']
      };

      if (editingPreset) {
        await base44.entities.DSPPreset.update(editingPreset.id, preset);
      } else {
        await base44.entities.DSPPreset.create(preset);
      }

      await loadPresets();
      setShowEditor(false);
      setEditingPreset(null);
      setPresetName('');
    } catch (error) {
      console.error('Failed to save preset:', error);
      alert('Failed to save preset');
    }
  };

  const deletePreset = async (id) => {
    if (!confirm('Delete this preset?')) return;
    
    try {
      await base44.entities.DSPPreset.delete(id);
      await loadPresets();
    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  };

  const toggleFavorite = async (preset) => {
    try {
      await base44.entities.DSPPreset.update(preset.id, {
        is_favorite: !preset.is_favorite
      });
      await loadPresets();
    } catch (error) {
      console.error('Failed to update favorite:', error);
    }
  };

  const exportPreset = (preset) => {
    const dataStr = JSON.stringify(preset, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${preset.preset_name}.json`;
    link.click();
  };

  const importPreset = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      
      await base44.entities.DSPPreset.create({
        ...imported,
        preset_name: `${imported.preset_name} (Imported)`,
        id: undefined,
        created_date: undefined
      });
      
      await loadPresets();
    } catch (error) {
      console.error('Failed to import preset:', error);
      alert('Failed to import preset');
    }
  };

  const factoryPresets = [
    {
      id: 'factory-broadcast',
      preset_name: 'Broadcast Standard',
      description: 'Professional broadcast mastering (-14 LUFS)',
      settings: {
        lufs_target: -14.0,
        compression: { enabled: true, threshold: -18, ratio: 3.0, attack: 5, release: 50, makeup_gain: 2.0 },
        eq: { high_shelf: { enabled: true, frequency: 8000, gain: 3.0 }, low_shelf: { enabled: false, frequency: 80, gain: 0 } },
        deessing: { enabled: false, frequency: 6000, threshold: -15, reduction: 6 },
        stereo_widening: { enabled: false, width: 1.2 },
        limiter: { enabled: true, ceiling: -0.3, release: 50 }
      }
    },
    {
      id: 'factory-podcast',
      preset_name: 'Podcast Master',
      description: 'Optimized for voice content (-16 LUFS)',
      settings: {
        lufs_target: -16.0,
        compression: { enabled: true, threshold: -20, ratio: 4.0, attack: 3, release: 40, makeup_gain: 3.0 },
        eq: { high_shelf: { enabled: true, frequency: 6000, gain: 2.0 }, low_shelf: { enabled: true, frequency: 100, gain: -2.0 } },
        deessing: { enabled: true, frequency: 6000, threshold: -15, reduction: 6 },
        stereo_widening: { enabled: false, width: 1.0 },
        limiter: { enabled: true, ceiling: -0.5, release: 50 }
      }
    },
    {
      id: 'factory-streaming',
      preset_name: 'Streaming Optimized',
      description: 'Spotify/Apple Music ready (-14 LUFS)',
      settings: {
        lufs_target: -14.0,
        compression: { enabled: true, threshold: -16, ratio: 2.5, attack: 5, release: 60, makeup_gain: 1.5 },
        eq: { high_shelf: { enabled: true, frequency: 10000, gain: 2.5 }, low_shelf: { enabled: false, frequency: 80, gain: 0 } },
        deessing: { enabled: false, frequency: 6000, threshold: -15, reduction: 6 },
        stereo_widening: { enabled: true, width: 1.1 },
        limiter: { enabled: true, ceiling: -0.3, release: 50 }
      }
    }
  ];

  return (
    <Card className="bg-slate-800/80 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            DSP Presets
          </div>
          <div className="flex gap-2">
            <label htmlFor="import-preset">
              <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </span>
              </Button>
            </label>
            <input
              id="import-preset"
              type="file"
              accept=".json"
              className="hidden"
              onChange={importPreset}
            />
            <Button
              onClick={() => {
                setShowEditor(true);
                setEditingPreset(null);
                setPresetName('');
                setPresetSettings(currentSettings || presetSettings);
              }}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Preset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showEditor ? (
          <div className="space-y-6">
            <div>
              <Label className="text-white">Preset Name</Label>
              <Input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="My Custom Preset"
                className="bg-slate-700 text-white"
              />
            </div>

            <Tabs defaultValue="compression" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-700">
                <TabsTrigger value="compression">Compression</TabsTrigger>
                <TabsTrigger value="eq">EQ</TabsTrigger>
                <TabsTrigger value="effects">Effects</TabsTrigger>
                <TabsTrigger value="limiter">Limiter</TabsTrigger>
              </TabsList>

              <TabsContent value="compression" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Enable Compression</Label>
                  <Switch
                    checked={presetSettings.compression.enabled}
                    onCheckedChange={(checked) => setPresetSettings({
                      ...presetSettings,
                      compression: { ...presetSettings.compression, enabled: checked }
                    })}
                  />
                </div>

                {presetSettings.compression.enabled && (
                  <>
                    <div>
                      <Label className="text-white">Threshold: {presetSettings.compression.threshold}dB</Label>
                      <Slider
                        value={[presetSettings.compression.threshold]}
                        onValueChange={([value]) => setPresetSettings({
                          ...presetSettings,
                          compression: { ...presetSettings.compression, threshold: value }
                        })}
                        min={-40}
                        max={0}
                        step={1}
                      />
                    </div>

                    <div>
                      <Label className="text-white">Ratio: {presetSettings.compression.ratio}:1</Label>
                      <Slider
                        value={[presetSettings.compression.ratio]}
                        onValueChange={([value]) => setPresetSettings({
                          ...presetSettings,
                          compression: { ...presetSettings.compression, ratio: value }
                        })}
                        min={1}
                        max={10}
                        step={0.1}
                      />
                    </div>

                    <div>
                      <Label className="text-white">Attack: {presetSettings.compression.attack}ms</Label>
                      <Slider
                        value={[presetSettings.compression.attack]}
                        onValueChange={([value]) => setPresetSettings({
                          ...presetSettings,
                          compression: { ...presetSettings.compression, attack: value }
                        })}
                        min={1}
                        max={100}
                        step={1}
                      />
                    </div>

                    <div>
                      <Label className="text-white">Release: {presetSettings.compression.release}ms</Label>
                      <Slider
                        value={[presetSettings.compression.release]}
                        onValueChange={([value]) => setPresetSettings({
                          ...presetSettings,
                          compression: { ...presetSettings.compression, release: value }
                        })}
                        min={10}
                        max={500}
                        step={10}
                      />
                    </div>

                    <div>
                      <Label className="text-white">Makeup Gain: +{presetSettings.compression.makeup_gain}dB</Label>
                      <Slider
                        value={[presetSettings.compression.makeup_gain]}
                        onValueChange={([value]) => setPresetSettings({
                          ...presetSettings,
                          compression: { ...presetSettings.compression, makeup_gain: value }
                        })}
                        min={0}
                        max={10}
                        step={0.5}
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="eq" className="space-y-4 pt-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-white">High Shelf (Air & Presence)</Label>
                    <Switch
                      checked={presetSettings.eq.high_shelf.enabled}
                      onCheckedChange={(checked) => setPresetSettings({
                        ...presetSettings,
                        eq: { ...presetSettings.eq, high_shelf: { ...presetSettings.eq.high_shelf, enabled: checked } }
                      })}
                    />
                  </div>

                  {presetSettings.eq.high_shelf.enabled && (
                    <>
                      <div className="mb-4">
                        <Label className="text-white">Frequency: {presetSettings.eq.high_shelf.frequency}Hz</Label>
                        <Slider
                          value={[presetSettings.eq.high_shelf.frequency]}
                          onValueChange={([value]) => setPresetSettings({
                            ...presetSettings,
                            eq: { ...presetSettings.eq, high_shelf: { ...presetSettings.eq.high_shelf, frequency: value } }
                          })}
                          min={2000}
                          max={16000}
                          step={100}
                        />
                      </div>

                      <div>
                        <Label className="text-white">Gain: +{presetSettings.eq.high_shelf.gain}dB</Label>
                        <Slider
                          value={[presetSettings.eq.high_shelf.gain]}
                          onValueChange={([value]) => setPresetSettings({
                            ...presetSettings,
                            eq: { ...presetSettings.eq, high_shelf: { ...presetSettings.eq.high_shelf, gain: value } }
                          })}
                          min={0}
                          max={10}
                          step={0.5}
                        />
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="effects" className="space-y-4 pt-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-white">De-esser</Label>
                    <Switch
                      checked={presetSettings.deessing.enabled}
                      onCheckedChange={(checked) => setPresetSettings({
                        ...presetSettings,
                        deessing: { ...presetSettings.deessing, enabled: checked }
                      })}
                    />
                  </div>

                  {presetSettings.deessing.enabled && (
                    <div>
                      <Label className="text-white">Reduction: {presetSettings.deessing.reduction}dB</Label>
                      <Slider
                        value={[presetSettings.deessing.reduction]}
                        onValueChange={([value]) => setPresetSettings({
                          ...presetSettings,
                          deessing: { ...presetSettings.deessing, reduction: value }
                        })}
                        min={1}
                        max={12}
                        step={1}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-white">Stereo Widening</Label>
                    <Switch
                      checked={presetSettings.stereo_widening.enabled}
                      onCheckedChange={(checked) => setPresetSettings({
                        ...presetSettings,
                        stereo_widening: { ...presetSettings.stereo_widening, enabled: checked }
                      })}
                    />
                  </div>

                  {presetSettings.stereo_widening.enabled && (
                    <div>
                      <Label className="text-white">Width: {presetSettings.stereo_widening.width.toFixed(2)}x</Label>
                      <Slider
                        value={[presetSettings.stereo_widening.width]}
                        onValueChange={([value]) => setPresetSettings({
                          ...presetSettings,
                          stereo_widening: { ...presetSettings.stereo_widening, width: value }
                        })}
                        min={1.0}
                        max={2.0}
                        step={0.1}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="limiter" className="space-y-4 pt-4">
                <div>
                  <Label className="text-white">Target LUFS: {presetSettings.lufs_target}dB</Label>
                  <Slider
                    value={[presetSettings.lufs_target]}
                    onValueChange={([value]) => setPresetSettings({
                      ...presetSettings,
                      lufs_target: value
                    })}
                    min={-23}
                    max={-8}
                    step={0.5}
                  />
                </div>

                <div>
                  <Label className="text-white">Limiter Ceiling: {presetSettings.limiter.ceiling}dB</Label>
                  <Slider
                    value={[presetSettings.limiter.ceiling]}
                    onValueChange={([value]) => setPresetSettings({
                      ...presetSettings,
                      limiter: { ...presetSettings.limiter, ceiling: value }
                    })}
                    min={-1.0}
                    max={0.0}
                    step={0.1}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowEditor(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={savePreset}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Preset
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-2">Factory Presets</h3>
              <div className="space-y-2">
                {factoryPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => onPresetSelect(preset.settings)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{preset.preset_name}</p>
                        <p className="text-slate-400 text-sm">{preset.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPresetSelect(preset.settings);
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {presets.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-2">My Presets</h3>
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-3 bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleFavorite(preset)}
                          >
                            <Star className={`w-4 h-4 ${preset.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'}`} />
                          </Button>
                          <div>
                            <p className="text-white font-semibold">{preset.preset_name}</p>
                            <p className="text-slate-400 text-xs">
                              Used {preset.usage_count || 0} times
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onPresetSelect(preset.settings)}
                          >
                            Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => exportPreset(preset)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deletePreset(preset.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}