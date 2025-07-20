/**
 * 模板编译器
 *
 * 功能：
 * 1. 将模板字符串中的 {{变量名}} 替换为真实值
 * 2. 检测 map 中未使用的变量名
 * 3. 检测 HTML 中未被替换的双大括号占位符
 */

/**
 * 模板编译器类
 */
class TemplateCompiler {
  /**
   * 编译模板
   * @param template 模板字符串
   * @param variables 变量映射表
   * @param options 编译选项
   * @returns 编译结果
   */
  compile(template: string, variables: Record<string, any>) {
    // 1. 进行模板替换
    let html = template;
    const usedVariables = new Set<string>();

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      if (html.includes(placeholder)) {
        html = html.replaceAll(placeholder, String(value));
        usedVariables.add(key);
      }
    });

    // 2. 找出 map 中未使用的变量名
    const unusedVariables = Object.keys(variables).filter((key) => !usedVariables.has(key));

    // 3. 找出 HTML 中未被替换的双大括号占位符
    const unreplacedPlaceholders = this.findUnreplacedPlaceholders(html);

    return {
      html,
      unusedVariables,
      unreplacedPlaceholders,
    };
  }

  /**
   * 查找未被替换的双大括号占位符
   * @param html HTML 字符串
   * @returns 未替换的占位符数组
   */
  private findUnreplacedPlaceholders(html: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(html)) !== null) {
      matches.push(match[0]); // 完整的占位符，如 {{VARIABLE_NAME}}
    }

    // 去重
    return [...new Set(matches)];
  }

  /**
   * 获取模板中所有的占位符变量名
   * @param template 模板字符串
   * @returns 占位符变量名数组（去重）
   */
  extractPlaceholders(template: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const placeholders: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(template)) !== null) {
      placeholders.push(match[1].trim()); // 只要变量名，不要大括号
    }

    // 去重并排序
    return [...new Set(placeholders)].sort();
  }

  /**
   * 生成变量使用报告
   * @param template 模板字符串
   * @param variables 变量映射表
   * @returns 使用报告
   */
  generateReport(
    template: string,
    variables: Record<string, any>
  ): {
    totalVariables: number;
    usedVariables: number;
    unusedVariables: number;
    totalPlaceholders: number;
    replacedPlaceholders: number;
    unreplacedPlaceholders: number;
    usageRate: string;
    replacementRate: string;
  } {
    const result = this.compile(template, variables);
    const totalPlaceholders = this.extractPlaceholders(template).length;

    const totalVariables = Object.keys(variables).length;
    const usedVariables = totalVariables - result.unusedVariables.length;
    const replacedPlaceholders = totalPlaceholders - result.unreplacedPlaceholders.length;

    return {
      totalVariables,
      usedVariables,
      unusedVariables: result.unusedVariables.length,
      totalPlaceholders,
      replacedPlaceholders,
      unreplacedPlaceholders: result.unreplacedPlaceholders.length,
      usageRate:
        totalVariables > 0 ? `${Math.round((usedVariables / totalVariables) * 100)}%` : '0%',
      replacementRate:
        totalPlaceholders > 0
          ? `${Math.round((replacedPlaceholders / totalPlaceholders) * 100)}%`
          : '100%',
    };
  }
}

const compiler = new TemplateCompiler();

export default compiler;
