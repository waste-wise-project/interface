'use client';

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const WasteClassificationForm = () => {
  const { isConnected } = useAccount();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // 图片拖拽处理
  const onDrop = React.useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedImage(file);
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, []);

  // 获取位置信息和更新时间
  useEffect(() => {
    setMounted(true);
    
    // 模拟获取IP位置信息
    setLocation({
      country: '中国',
      region: '广东省',
      city: '深圳市',
      ip: '192.168.1.100'
    });
    
    // 每秒更新时间
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  // 如果钱包未连接，显示连接提示
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🗑️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">垃圾分类挑战</h1>
          <p className="text-gray-600 mb-8">连接钱包开始您的环保分类挑战</p>
          <div className="flex justify-center">
            {mounted && <ConnectButton />}        
          </div>
        </div>
      </div>
    );
  }

  // 垃圾分类类型
  const wasteTypes = [
    {
      id: 'recyclable',
      name: '可回收',
      description: '废纸、塑料、玻璃、金属等',
      examples: ['纸箱', '塑料瓶', '玻璃瓶', '易拉罐'],
      icon: '♻️',
      selectedColor: 'ring-2 ring-green-500 bg-green-50',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'hazardous',
      name: '有害',
      description: '废电池、废灯管、废药品等',
      examples: ['电池', '灯泡', '过期药品', '油漆桶'],
      icon: '☢️',
      selectedColor: 'ring-2 ring-orange-500 bg-orange-50',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'wet',
      name: '湿垃圾',
      description: '易腐垃圾，食材废料等',
      examples: ['果皮', '菜叶', '剩菜剩饭', '蛋壳'],
      icon: '🥬',
      selectedColor: 'ring-2 ring-green-500 bg-green-50',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'dry',
      name: '干垃圾',
      description: '除上述三类之外的垃圾',
      examples: ['烟蒂', '陶瓷', '尿不湿', '猫砂'],
      icon: '🗑️',
      selectedColor: 'ring-2 ring-gray-500 bg-gray-50',
      hoverColor: 'hover:bg-gray-50'
    }
  ];

  // AI识别函数
  const analyzeWithAI = async (imageUrlInput, userSelectedType) => {
    try {
      console.log('发送AI请求:', {
        url: 'http://localhost:4111/api/agents/wasteClassifier/generate',
        method: 'POST',
        body: {
          messages: [{
            role: 'user',
            content: `分析图片：${imageUrlInput}，我认为是${wasteTypes.find(t => t.id === userSelectedType)?.name || userSelectedType}`
          }]
        }
      });

      const response = await fetch('http://localhost:4111/api/agents/wasteClassifier/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `分析图片：${imageUrlInput}，我认为是${wasteTypes.find(t => t.id === userSelectedType)?.name || userSelectedType}`
          }]
        })
      });

      console.log('AI响应状态:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI服务响应错误:', errorText);
        throw new Error(`AI服务请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AI响应数据:', data);
      return data;
    } catch (error) {
      console.error('AI分析错误:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if ((!selectedImage && !imageUrl) || !selectedType || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      let finalImageUrl = imageUrl;
      
      // 如果没有输入URL但有上传的图片，这里可以实现图片上传到云存储的逻辑
      if (!finalImageUrl && selectedImage) {
        // 这里应该将图片上传到云存储服务并获取URL
        // 暂时使用一个示例URL
        finalImageUrl = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500';
      }

      if (!finalImageUrl) {
        throw new Error('请提供图片URL或上传图片');
      }

      // 调用AI分析
      const aiResponse = await analyzeWithAI(finalImageUrl, selectedType);
      
      // 解析真实的AI响应数据
      const aiText = aiResponse.text || '';
      const usage = aiResponse.usage || {};
      
      // 从AI响应中提取关键信息
      const aiDetectedCategory = extractDetectedCategory(aiText);
      const confidence = extractConfidence(aiText);
      const isCorrect = checkIfCorrect(aiText);
      
      // 构建结果对象，使用真实AI数据
      const result = {
        isCorrect,
        aiPrediction: aiDetectedCategory,
        confidence: confidence / 100,
        reasoning: isCorrect ? 'AI认为分类正确！' : 'AI认为分类错误',
        aiAnalysis: aiText,
        rawAiResponse: aiResponse, // 保存完整的AI响应
        usage: {
          promptTokens: usage.promptTokens || 0,
          completionTokens: usage.completionTokens || 0,
          totalTokens: usage.totalTokens || 0
        },
        submissionData: {
          fileName: selectedImage?.name || 'URL图片',
          fileSize: selectedImage?.size || 0,
          selectedCategory: wasteTypes.find(t => t.id === selectedType)?.name,
          country: location?.country,
          region: location?.region,
          city: location?.city,
          ipAddress: location?.ip,
          submittedAt: currentTime.toLocaleString('zh-CN'),
          imageUrl: finalImageUrl,
          aiModelUsed: aiResponse.response?.modelId || 'gpt-4o',
          requestId: aiResponse.response?.id || 'unknown'
        }
      };
      
      setResult(result);
    } catch (error) {
      console.error('提交错误:', error);
      // 显示错误信息给用户
      const errorResult = {
        isCorrect: false,
        aiPrediction: 'error',
        confidence: 0,
        reasoning: `分析失败: ${error.message}`,
        aiAnalysis: '无法连接到AI服务，请检查网络连接或稍后重试。',
        submissionData: {
          fileName: selectedImage?.name || 'URL图片',
          selectedCategory: wasteTypes.find(t => t.id === selectedType)?.name,
          submittedAt: currentTime.toLocaleString('zh-CN'),
          error: error.message
        }
      };
      setResult(errorResult);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 辅助函数：从AI响应中提取检测到的类别
  const extractDetectedCategory = (text) => {
    // 优先查找AI识别结果部分
    if (text.includes('AI识别结果：')) {
      const match = text.match(/AI识别结果：([^，\n]+)/);
      if (match) return match[1].trim();
    }
    
    // 查找具体的垃圾类型
    if (text.includes('垃圾桶')) return '垃圾桶';
    if (text.includes('可回收垃圾')) return '可回收垃圾';
    if (text.includes('有害垃圾')) return '有害垃圾';
    if (text.includes('湿垃圾') || text.includes('厨余垃圾')) return '湿垃圾/厨余垃圾';
    if (text.includes('干垃圾') || text.includes('其他垃圾')) return '干垃圾/其他垃圾';
    
    // 从分析报告中提取
    const categoryMatch = text.match(/(?:识别|检测|分类)(?:为|结果|是)[:：]?\s*([^，。\n]+)/);
    if (categoryMatch) return categoryMatch[1].trim();
    
    return '未识别';
  };

  // 辅助函数：从AI响应中提取置信度
  const extractConfidence = (text) => {
    // 查找各种置信度格式
    const patterns = [
      /置信度[:：]\s*(\d+(?:\.\d+)?)%/,
      /AI置信度[:：]\s*(\d+(?:\.\d+)?)%/,
      /(\d+(?:\.\d+)?)%/g
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const confidence = parseFloat(match[1]);
        if (confidence >= 0 && confidence <= 100) {
          return confidence;
        }
      }
    }
    
    return 85; // 默认置信度
  };

  // 辅助函数：检查分类是否正确
  const checkIfCorrect = (text) => {
    // 明确的正确指示
    if (text.includes('分类正确') || text.includes('✅') || text.includes('🎉')) {
      return true;
    }
    
    // 明确的错误指示
    if (text.includes('分类错误') || text.includes('分类有误') || text.includes('❌')) {
      return false;
    }
    
    // 检查匹配状态
    if (text.includes('"match":false') || text.includes('"match": false')) {
      return false;
    }
    
    if (text.includes('"match":true') || text.includes('"match": true')) {
      return true;
    }
    
    // 分析得分（假设低于50分为错误）
    const scoreMatch = text.match(/(?:得分|分数|score)[:：]\s*(\d+)/i);
    if (scoreMatch) {
      const score = parseInt(scoreMatch[1]);
      return score >= 50;
    }
    
    // 默认返回false（更保守的选择）
    return false;
  };

  const resetForm = () => {
    setSelectedImage(null);
    setSelectedType('');
    setResult(null);
    setPreview(null);
    setImageUrl('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌍 让垃圾分类变有趣
          </h1>
          <p className="text-xl text-gray-600">
            正确分类垃圾，获得独特的环保NFT，为地球做贡献！
          </p>
        </div>

        {/* 统计面板 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            📊 我的统计数据
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <div className="text-sm text-gray-600">正确次数</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-3xl font-bold text-red-600 mb-2">0</div>
              <div className="text-sm text-gray-600">错误次数</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">0%</div>
              <div className="text-sm text-gray-600">准确率</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">100</div>
              <div className="text-sm text-gray-600">信誉分</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-3xl font-bold text-yellow-600 mb-2">0</div>
              <div className="text-sm text-gray-600">NFT总数</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 左侧：图片上传 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              📷 上传垃圾图片
            </h2>
            
            {/* 图片URL输入 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                或输入图片URL：
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
              }`}
            >
              <input {...getInputProps()} />
              
              {preview ? (
                <div className="space-y-4">
                  <img 
                    src={preview} 
                    alt="预览" 
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">
                      {selectedImage?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round((selectedImage?.size || 0) / 1024)}KB
                    </p>
                  </div>
                </div>
              ) : imageUrl ? (
                <div className="space-y-4">
                  <img 
                    src={imageUrl} 
                    alt="URL图片" 
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                    onError={() => console.log('图片加载失败')}
                  />
                  <p className="text-sm font-medium text-gray-700">URL图片</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-6xl text-gray-400">📸</div>
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {isDragActive ? '放开以上传' : '点击或拖拽上传图片'}
                    </p>
                    <p className="text-sm text-gray-500">
                      支持 JPG、PNG、WebP，最大 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 位置和时间信息 */}
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  📍 当前位置
                </h3>
                {location ? (
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">国家:</span> {location.country}</p>
                    <p><span className="font-medium">省份:</span> {location.region}</p>
                    <p><span className="font-medium">城市:</span> {location.city}</p>
                    <p><span className="font-medium">IP地址:</span> {location.ip}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">正在获取位置信息...</p>
                )}
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  🕐 当前时间
                </h3>
                {mounted ? (
                  <p className="text-sm text-gray-600">
                    {currentTime.toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">正在加载时间...</p>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：垃圾分类选择 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
              🗑️ 请选择垃圾分类
            </h2>
            
            <div className="space-y-3">
              {wasteTypes.map((type) => (
                <div 
                  key={type.id}
                  className={`relative cursor-pointer rounded-xl border border-gray-200 p-4 transition-all duration-200 ${
                    selectedType === type.id
                      ? type.selectedColor
                      : `bg-white ${type.hoverColor}`
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                        {type.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {type.name}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 提交按钮 */}
            <div
              onClick={handleSubmit}
              className={`mt-6 w-full py-4 px-6 rounded-xl text-center font-semibold transition-all duration-300 cursor-pointer ${
                (!selectedImage && !imageUrl) || !selectedType || isSubmitting
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transform hover:scale-105 shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>AI识别中...</span>
                </div>
              ) : (
                '🚀 开始AI识别'
              )}
            </div>
          </div>
        </div>

        {/* 结果显示 */}
        {result && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🎯 AI识别结果
            </h2>
            
            <div className={`p-6 rounded-xl ${
              result.isCorrect 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">
                    {result.isCorrect ? '🎉' : '❌'}
                  </span>
                  <span className="text-xl font-bold">
                    {result.isCorrect ? 'AI认为分类正确！' : 'AI认为分类错误'}
                  </span>
                </div>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  result.isCorrect 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  置信度: {Math.round(result.confidence * 100)}%
                </span>
              </div>
              
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <span className="font-medium">你的选择:</span> {wasteTypes.find(t => t.id === selectedType)?.name}
                </p>
                <p>
                  <span className="font-medium">AI识别:</span> {result.aiPrediction}
                </p>
                <p>
                  <span className="font-medium">结果:</span> {result.reasoning}
                </p>
                
                {/* AI详细分析 */}
                {result.aiAnalysis && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium mb-2">AI详细分析:</h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-xs leading-relaxed max-h-60 overflow-y-auto">
                      <div className="whitespace-pre-wrap">{result.aiAnalysis}</div>
                    </div>
                  </div>
                )}

                {/* AI使用统计 */}
                {result.usage && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium mb-2">AI使用统计:</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <p><span className="font-medium">输入Token:</span> {result.usage.promptTokens}</p>
                      <p><span className="font-medium">输出Token:</span> {result.usage.completionTokens}</p>
                      <p><span className="font-medium">总Token:</span> {result.usage.totalTokens}</p>
                    </div>
                  </div>
                )}
                
                {result.submissionData && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-medium mb-2">提交信息:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <p><span className="font-medium">位置:</span> {result.submissionData.country} {result.submissionData.region} {result.submissionData.city}</p>
                      <p><span className="font-medium">时间:</span> {result.submissionData.submittedAt}</p>
                      <p><span className="font-medium">文件:</span> {result.submissionData.fileName}</p>
                      <p><span className="font-medium">IP:</span> {result.submissionData.ipAddress}</p>
                      <p><span className="font-medium">AI模型:</span> {result.submissionData.aiModelUsed}</p>
                      <p><span className="font-medium">请求ID:</span> {result.submissionData.requestId}</p>
                      {result.submissionData.imageUrl && (
                        <p className="col-span-2"><span className="font-medium">图片URL:</span> 
                          <a href={result.submissionData.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 ml-1 break-all">
                            {result.submissionData.imageUrl}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              onClick={resetForm}
              className="mt-4 w-full py-3 px-6 bg-blue-500 text-white rounded-xl text-center font-medium hover:bg-blue-600 transition-colors cursor-pointer"
            >
              🔄 继续挑战
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteClassificationForm;