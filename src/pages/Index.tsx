import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoDownloadUrl, setVideoDownloadUrl] = useState("");
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToImgbb = async (file: File): Promise<string> => {
    const formData = new FormData();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.readAsDataURL(file);
    });

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=9d21b0d6b3ec102d90d31ef07701a1c2`,
      {
        method: "POST",
        body: new URLSearchParams({
          image: base64,
        }),
      }
    );

    const data = await response.json();
    if (data.success) {
      return data.data.url;
    }
    throw new Error("Image upload failed");
  };

  const generateVideo = async () => {
    if (!selectedImage || !text.trim()) {
      toast({
        title: "Missing Information",
        description: "Please upload an image and enter text.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setVideoDownloadUrl("");

    try {
      // Upload image to imgbb
      const imageUrl = await uploadToImgbb(selectedImage);

      // Send to n8n webhook
      const response = await fetch(
        "https://aiautomationbybhmi.app.n8n.cloud/webhook-test/generate-video",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            script: {
              type: "text",
              input: text,
            },
            source_url: imageUrl,
            config: {
              stitch: "true",
            },
          }),
        }
      );

      const data = await response.json();
      
      if (data.video_url || data.download_url || data.url) {
        const videoUrl = data.video_url || data.download_url || data.url;
        setVideoDownloadUrl(videoUrl);
        toast({
          title: "✅ Video Generated!",
          description: "Your video is ready to download.",
        });
      } else {
        throw new Error("No video URL in response");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "⚠️ Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 animate-gradient-shift bg-[length:200%_200%]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,183,0.1),transparent_50%)]" />
      
      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <motion.section
          className="text-center py-20 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-block mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-16 h-16 mx-auto text-primary drop-shadow-[0_0_15px_rgba(0,255,183,0.8)]" />
          </motion.div>
          
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-highlight to-secondary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,255,183,0.5)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            AI Video Generator 🎬
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Turn your images and text into stunning AI videos in seconds.
          </motion.p>
        </motion.section>

        {/* Main Form */}
        <motion.div
          className="max-w-2xl mx-auto px-4 pb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="bg-card/40 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-primary/30 shadow-2xl hover:shadow-glow-primary transition-all duration-500 hover:scale-[1.02]">
            {/* Image Upload */}
            <div className="mb-8">
              <label className="block text-lg font-semibold mb-4 text-foreground">
                Upload Image
              </label>
              <div
                className="relative border-2 border-dashed border-primary/40 rounded-2xl p-8 text-center hover:border-primary/60 transition-all duration-300 cursor-pointer group bg-accent/40"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                {imagePreview ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                      <p className="text-sm text-foreground font-medium">Click to change</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-8">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-primary/60 group-hover:text-primary transition-colors" />
                    <p className="text-foreground/80 font-medium">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Supports JPG, PNG, WEBP
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Text Input */}
            <div className="mb-8">
              <label className="block text-lg font-semibold mb-4 text-foreground">
                Enter Text to Speak
              </label>
              <Textarea
                placeholder="Type your video narration here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full min-h-32 bg-accent/40 border-primary/40 focus:border-primary/60 rounded-xl text-foreground placeholder:text-muted-foreground resize-none transition-all duration-300"
              />
            </div>

            {/* Generate Button */}
            <Button
              variant="hero"
              size="xl"
              onClick={generateVideo}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Video
                </>
              )}
            </Button>

            {/* Loading State */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <div className="inline-flex items-center gap-2 text-muted-foreground animate-pulse">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-secondary rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-highlight rounded-full animate-bounce delay-200" />
                  <span className="ml-2">Creating your masterpiece...</span>
                </div>
              </motion.div>
            )}

            {/* Download Section */}
            {videoDownloadUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-8 p-6 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl border border-primary/50"
              >
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-3">
                    <Download className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Your video is ready! 🎥
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Click below to download your AI-generated video
                  </p>
                </div>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => window.open(videoDownloadUrl, "_blank")}
                  className="w-full"
                >
                  <Download className="w-5 h-5" />
                  Download Video
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="text-center py-8 px-4 text-sm text-muted-foreground">
          <p>© 2025 AI Automation by BHMI — All Rights Reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
