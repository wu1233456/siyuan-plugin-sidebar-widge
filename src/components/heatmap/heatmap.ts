import * as d3 from 'd3';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

export class Heatmap {
    private element: HTMLElement;
    private width: number;
    private height: number = 160;
    private margin = { top: 12, right: 12, bottom: 12, left: 12 };
    private weekBoxWidth = 12;
    private monthBoxHeight = 12;
    private colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

    constructor(element: HTMLElement) {
        this.element = element;
        this.width = element.clientWidth - 8; // 减小padding
        this.init();
    }

    private async init() {
        // 设置标题和样式
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 6px 10px 4px;
            font-size: 13px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        // 先创建标题元素，稍后更新内容
        const titleSpan = document.createElement('span');
        titleSpan.style.fontSize = '12px';
        header.appendChild(titleSpan);
        
        this.element.appendChild(header);

        const content = document.createElement('div');
        content.id = 'calendarHeatmapContent';
        content.style.cssText = `
            padding: 0 4px;
            position: relative;
        `;
        this.element.appendChild(content);

        // 获取数据并更新标题
        const { days } = await this.dataChart();
        const totalBlocks = days.reduce((sum, day) => sum + (day.total || 0), 0);
        titleSpan.textContent = `热力图（近三个月${totalBlocks} 个块）`;

        await this.renderHeatmap();
    }

    private async renderHeatmap() {
        // 删除上一次作图和提示框
        d3.selectAll('.heatmap-tooltip').remove();
        d3.select('#calendarHeatmapContent').selectAll('*').remove();
        
        // 创建容器并添加提示框
        const container = d3.select('#calendarHeatmapContent')
            .style('position', 'relative');
            
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'heatmap-tooltip')
            .style('position', 'fixed')
            .style('visibility', 'hidden')
            .style('background-color', 'var(--b3-card-background)')
            .style('color', 'var(--b3-theme-on-background)')
            .style('padding', '6px 10px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('line-height', '1.4')
            .style('box-shadow', '0 3px 14px rgba(0, 0, 0, 0.15)')
            .style('pointer-events', 'none')
            .style('z-index', '9999')
            .style('white-space', 'nowrap')
            .style('border', '1px solid var(--b3-theme-surface-lighter)')
            .style('-webkit-font-smoothing', 'antialiased')
            .style('-moz-osx-font-smoothing', 'grayscale')
            .style('font-family', 'var(--b3-font-family)');

        // 获取svg并定义svg高度和宽度
        const svg = container
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height - 35);
        
        // 获取数据并绘制图表
        const { months, days } = await this.dataChart();

        this.monthCoordinate(svg, months);
        this.weekCoordinate(svg);
        await this.dateSquares(svg, days, tooltip);
    }

    private monthCoordinate(svg: any, months: string[]) {
        // 只显示最近3个月
        const recentMonths = months.slice(-3);
        
        const monthBox = svg
            .append('g')
            .attr(
                'transform',
                'translate(' + (this.margin.left - 4) + ', ' + this.margin.top + ')',
            );

        const monthScale = d3
            .scaleLinear()
            .domain([0, recentMonths.length])
            .range([12, this.width - this.weekBoxWidth]);

        monthBox
            .selectAll('text')
            .data(recentMonths)
            .enter()
            .append('text')
            .text(function(d) {
                return d;
            })
            .attr('font-size', '10px')
            .attr('font-family', 'monospace')
            .attr('fill', '#5D6063')
            .attr('x', (function(d, i) {
                return monthScale(i);
            }));
    }

    private weekCoordinate(svg: any) {
        const weeks = ['一', '三', '五', '日'];
        const weekBox = svg
            .append('g')
            .attr(
                'transform',
                `translate(${this.margin.left - 12}, ${this.margin.top + this.monthBoxHeight})`,
            );

        const weekScale = d3
            .scaleLinear()
            .domain([0, weeks.length])
            .range([0, this.height - this.margin.right - this.monthBoxHeight - 10]);

        weekBox
            .selectAll('text')
            .data(weeks)
            .enter()
            .append('text')
            .text((d) => {
                return d;
            })
            .attr('font-size', '10px')
            .attr('fill', '#5D6063')
            .attr('y', (d, i) => {
                return weekScale(i);
            });
    }

    private async dateSquares(svg: any, days: any[], tooltip: any) {
        const cellBox = svg
            .append('g')
            .attr(
                'transform',
                'translate(' + ((this.margin.left - 12) + this.weekBoxWidth) + ', ' + (this.margin.top + 8) + ')',
            );
        
        // 设置方块间距
        const cellMargin = 2;
        // 计算方块大小
        const cellSize = (this.height - this.margin.right - this.monthBoxHeight - cellMargin * 6 - 25) / 7;
        
        // 方块列计数器
        let cellCol = 0;
        
        // 只显示最近3个月的数据
        const recentDays = days.slice(-90);
        
        // 添加过渡效果
        const cells = cellBox
            .selectAll('rect')
            .data(recentDays)
            .enter()
            .append('rect')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .style('cursor', 'pointer')
            .style('transition', 'opacity 150ms ease');
            
        // 设置颜色和位置
        cells.attr('fill', (d) => {
                if (d.total === undefined || d.total === 0) {
                    return this.colors[0];
                }
                let total = d.total;
                if (total > 0) {
                    if (total <= 10) {
                        return this.colors[1];
                    } else if (total <= 30) {
                        return this.colors[2];
                    } else if (total <= 60) {
                        return this.colors[3];
                    }
                    return this.colors[4];
                }
                return this.colors[0];
            })
            .attr('x', (d, i) => {
                if (i % 7 === 0) cellCol++;
                const x = (cellCol - 1) * cellSize;
                return cellCol > 1 ? x + cellMargin * (cellCol - 1) : x;
            })
            .attr('y', (d, i) => {
                const y = i % 7;
                return y > 0 ? y * cellSize + cellMargin * y : y * cellSize;
            })
            .attr('id', d => `heatmap-${d.date}`);
            
        // 添加悬停效果
        cells.on('mouseover', (event, d) => {
                const date = new Date(d.date);
                const formatDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
                
                let content = '';
                if (d.total === undefined || d.total === 0) {
                    content = `<div style="font-weight: 500;">${formatDate}</div><div style="opacity: 0.86;">暂无内容</div>`;
                } else {
                    let countText = '';
                    if (d.total <= 10) {
                        countText = '少量';
                    } else if (d.total <= 30) {
                        countText = '适中';
                    } else if (d.total <= 60) {
                        countText = '较多';
                    } else {
                        countText = '大量';
                    }
                    content = `<div style="font-weight: 500;">${formatDate}</div><div style="opacity: 0.86;">${countText}内容：${d.total} 个块</div>`;
                }
                
                tooltip.html(content)
                    .style('visibility', 'visible');
                    
                const tooltipNode = tooltip.node();
                const tooltipRect = tooltipNode.getBoundingClientRect();
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                
                let left = event.clientX + 10;
                let top = event.clientY - 10;
                
                if (left + tooltipRect.width > windowWidth - 20) {
                    left = event.clientX - tooltipRect.width - 10;
                }
                
                if (top + tooltipRect.height > windowHeight - 20) {
                    top = event.clientY - tooltipRect.height - 10;
                }
                
                tooltip
                    .style('left', `${left}px`)
                    .style('top', `${top}px`);
                    
                d3.select(event.target)
                    .transition()
                    .duration(150)
                    .style('opacity', 0.8)
                    .style('stroke', 'var(--b3-theme-on-surface)')
                    .style('stroke-width', '1px');
            })
            .on('mousemove', (event) => {
                const tooltipNode = tooltip.node();
                const tooltipRect = tooltipNode.getBoundingClientRect();
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                
                let left = event.clientX + 10;
                let top = event.clientY - 10;
                
                if (left + tooltipRect.width > windowWidth - 20) {
                    left = event.clientX - tooltipRect.width - 10;
                }
                
                if (top + tooltipRect.height > windowHeight - 20) {
                    top = event.clientY - tooltipRect.height - 10;
                }
                
                tooltip
                    .style('left', `${left}px`)
                    .style('top', `${top}px`);
            })
            .on('mouseout', function() {
                tooltip.style('visibility', 'hidden');
                
                d3.select(this)
                    .transition()
                    .duration(150)
                    .style('opacity', 1)
                    .style('stroke', null)
                    .style('stroke-width', null);
            });

        // 当日日期标记
        const date = new Date();
        const day = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        svg.select(`#heatmap-${day}`)
           .style('stroke', 'var(--b3-theme-primary)')
           .style('stroke-width', '1px');
    }

    private async queryDate() {
        const sql = `SELECT SUBSTR(created, 1, 8) AS date, COUNT(*) count FROM blocks WHERE type = 'p' GROUP BY SUBSTR(created, 1, 8) ORDER BY date DESC LIMIT 90`;
        const response = await (await axios.post('/api/query/sql', { stmt: sql })).data.data;
        return response;
    }

    private async dataChart() {
        const resDate = await this.queryDate();
        let formatParams = [];
        
        if (resDate != null) {
            resDate.forEach(param => {
                const { date, count } = param;
                const formatDate = `${date.substring(0, 4)}-${(date.substring(4, 6) >= 10 ? date.substring(4, 6) : date.substring(4, 6).substring(1, 2))}-${(date.substring(6, 8) >= 10 ? date.substring(6, 8) : date.substring(6, 8).substring(1, 2))}`;
                formatParams.push({ day: formatDate, total: count });
            });
        }

        const months = [];
        const days = [];

        // 只获取最近3个月的数据
        for (let i = 3; i > 0; i--) {
            const referDate = dayjs(new Date());
            const referDay = referDate.month((referDate.month() - i + 1));
            for (let j = 1; j <= referDay.daysInMonth(); j++) {
                let data = { date: referDay.year() + '-' + (referDay.month() + 1) + '-' + j, total: 0 };
                formatParams.forEach(item => {
                    if (item.day === data.date) {
                        data.total = item.total;
                    }
                });
                days.push(data);
            }
            months.push(referDay.year() + '-' + (referDay.month() + 1));
        }

        let firstDate = days[0].date;
        let d = new Date(firstDate);
        let day = d.getDay();
        if (day == 0) {
            day = 7;
        }

        for (let i = 1; i < day; i++) {
            const date = new Date(firstDate);
            date.setDate(date.getDate() - i);

            let formatDate = [date.getFullYear(), date.getMonth() + 1, date.getDate()];

            if (formatDate[1] < 10) {
                formatDate[1] = Number('0' + formatDate[1]);
            }

            if (formatDate[2] < 10) {
                formatDate[2] = Number('0' + formatDate[2]);
            }
            let total = 0;
            formatParams.forEach(item => {
                if (item.day === formatDate.join('-')) {
                    total = item.total;
                }
            });
            days.unshift({ date: formatDate.join('-'), total });
        }
        return { days, months };
    }
} 